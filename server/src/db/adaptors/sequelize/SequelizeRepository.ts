import 'reflect-metadata';
import * as Sequelize from 'sequelize';
import { Repository } from '../../Repository';
import { Model, IModel } from '../../Model';
import { MODELPROPERTIES } from '../../declarations';
import { Query } from '../../Query';
import { Specification, ModelByIdSpecification } from '../../specifications';
import { WhereOptions, Op, FindOptions, IncludeOptions } from 'sequelize';
import { SpecificationToken, ISpecificationTokenGroup } from '../../specifications/Specification';
import { Token } from '../../lexor';

export class SequelizeRepository extends Repository {
    private _db!: Sequelize.Sequelize;

    public constructor(private _options: Sequelize.Options) {
        super();
    }

    public async initialize() {
        this._db = new Sequelize(this._options);

        // Define all the models before adding in relationships.
        let allManyMappings: { [key: string]: { [key: string]: string } } = {};
        let allSingleMappings: { [key: string]: { [key: string]: string } } = {};
        for (let i = 0; i < this._modelClasses.length; ++i) {
            let Model = this._modelClasses[i];
            let props = Reflect.getMetadata(MODELPROPERTIES, Model);
            let model = new Model(this);

            let fields: { [key: string]: Sequelize.DefineAttributeColumnOptions } = {};
            let manyMappings: { [key: string]: string } = {};
            let singleMappings: { [key: string]: string } = {};
            for (let i = 0; i < props.length; ++i) {
                if (model instanceof props[i].constructor) {
                    let fieldType = Model.getFieldType(props[i].property);
                    if (Array.isArray(fieldType)) {
                        if ((<any>fieldType[0]).entityName !== undefined) {
                            manyMappings[props[i].property] = (<any>fieldType[0]).entityName;
                        } else {
                            // TODO: Need to serialize to a json object to be unserialized once coming down.
                        }
                    } else {
                        switch (fieldType) {
                            case String:
                                fields[props[i].property] = { type: Sequelize.STRING };
                                break;
                            case Number:
                                fields[props[i].property] = { type: Sequelize.NUMBER };
                                break;
                            case Boolean:
                                fields[props[i].property] = { type: Sequelize.BOOLEAN };
                                break;
                            case Date:
                                fields[props[i].property] = { type: Sequelize.DATE };
                                break;
                            default:
                                if ((<any>fieldType).entityName !== undefined) {
                                    singleMappings[props[i].property] = (<any>fieldType).entityName;
                                }
                                break;
                        }
                        if (fields[props[i].property] !== undefined) {
                            // Convert the basic options into sequelize.
                            let options = Model.getFieldOptions(props[i].property);
                            if (options !== undefined) {
                                if (options.isPrimary) fields[props[i].property].primaryKey = true;
                                if (options.autoIncrement) {
                                    if (fields[props[i].property].type === Sequelize.NUMBER) {
                                        fields[props[i].property].type = Sequelize.INTEGER;
                                    }
                                    fields[props[i].property].autoIncrement = true;
                                }
                            }
                        }
                    }
                }
            }
            if (Object.keys(singleMappings).length > 0) allSingleMappings[Model.entityName] = singleMappings;
            if (Object.keys(manyMappings).length > 0) allManyMappings[Model.entityName] = manyMappings;
            if (Object.keys(fields).length > 0) {
                this._db.define<any, any>(Model.entityName, fields);
            }
        }

        // Add in single relationships
        if (Object.keys(allSingleMappings).length > 0) {
            // TODO: Deal with single mappings
        }

        // Add in many relationships
        if (Object.keys(allManyMappings).length > 0) {
            let keys = Object.keys(allManyMappings);
            for (let i = 0; i < keys.length; ++i) {
                let modelMappings = allManyMappings[keys[i]];
                let propertyKeys = Object.keys(modelMappings);
                for (let j = 0; j < propertyKeys.length; ++j) {
                    let To = this._db.model(keys[i]);
                    let From = this._db.model(modelMappings[propertyKeys[j]]);
                    To.hasMany(From, { as: propertyKeys[j] });
                }
            }
        }
        return true;
    }

    public async listen() {
        if (this._db === undefined) await this.initialize();
        return await this._db.sync();
    }

    public async close(): Promise<boolean> {
        if (this._db) {
            try {
                await this._db.close();
            } catch (err) {
                return false;
            }
        }
        return true;
    }

    public async findAll<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>) {
        let Model = this._db.model<TModel, any>(entity.entityName);
        if (query === undefined) {
            return await Model.findAll();
        } else if (query instanceof Query) {
            return await Model.findAll(this.parseQuery(entity, query));
        } else if (query instanceof Specification) {
            return await Model.findAll({ where: this.parseSpecification(query) });
        }
        return [];
    }

    public async findOne<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>): Promise<TModel | null> {
        let Model = this._db.model<TModel, any>(entity.entityName);
        if (query === undefined) {
            return await Model.findOne();
        } else if (query instanceof Query) {
            return await Model.findOne(this.parseQuery(entity, query));
        } else if (query instanceof Specification) {
            return await Model.findOne({ where: this.parseSpecification(query) });
        }
        return null;
    }

    public async save<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]) {
        let Model = this._db.model<TModel, any>(entity.entityName);

        let savedModels: TModel[] = [];
        for (let i = 0; i < models.length; ++i) {
            let model = await this.findOne(entity, new ModelByIdSpecification<TModel>(models[i].id));
            if (model === null) {
                savedModels.push(this.mapColumns(entity, (await Model.create(models[i])), new entity(this)));
            } else {
                model = this.mapColumns(entity, model, models[i]);
                savedModels.push(this.mapColumns(entity, (await (<any>model).save()), model));
            }
        }
        return savedModels;
    }

    public async destroy<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]) {
        for (let i = 0; i < models.length; ++i) {
            let model = await this.findOne(entity, new ModelByIdSpecification<TModel>(models[i].id));
            if (model !== null) {
                await (<any>model).destroy();
            }
        }
        return true;
    }

    //#region Parse Query and Specifications
    private parseSpecification<TModel extends Model>(spec: Specification<TModel>): WhereOptions<TModel> {
        return this.generateWhere(spec, spec.tokens);
    }
    
    private parseInclude<TModel extends Model>(model: IModel<TModel>, include: string[]): IncludeOptions[] {
        let includes: IncludeOptions[] = [];
        for (let i = 0; i < include.length; ++i) {
            let Model = <any>model.getFieldType(include[i]);
            if (Array.isArray(Model)) Model = Model[0];
            if (Model.entityName !== undefined) {
                includes.push({
                    model: this._db.model(Model.entityName),
                    as: include[i]
                });
            }
        }
        return includes;
    }
    
    private parseOrder(order: string | string[] | Object) {
        if (typeof order === 'string') {
            return [[order, 'ASC']];
        } else if (Array.isArray(order)) {
            return order.map(x => [x, 'ASC']);
        } else {
            let keys = Object.keys(order);
            return keys.map(x => [x, order[x]]);
        }
    }
    
    private parseQuery<TModel extends Model>(model: IModel<TModel>, query: Query<TModel>): FindOptions<TModel> {
        let queryOptions = query.options;
        let options: FindOptions<TModel> = {};
        if (queryOptions.where !== undefined) options.where = this.parseSpecification(queryOptions.where);
        if (queryOptions.include !== undefined) options.include = this.parseInclude(model, queryOptions.include);
        if (queryOptions.group !== undefined) options.group = queryOptions.group;
        if (queryOptions.order !== undefined) options.order = this.parseOrder(queryOptions.order);
        if (queryOptions.limit !== undefined) options.limit = queryOptions.limit;
        if (queryOptions.offset !== undefined) options.offset = queryOptions.offset;
        return options;
    }
    
    private generateWhere<TModel extends Model>(spec: Specification<TModel>, parsedTokens: SpecificationToken[]): any {
        if (parsedTokens.length === 1) {
            return this.generateClause(spec, <ISpecificationTokenGroup>parsedTokens[0]);
        } else {
            let op = this.getOperator((<ISpecificationTokenGroup>parsedTokens[1]).op);
            let conditions: any[] = [];
            for (let i = 0; i < parsedTokens.length; i += 2) {
                if (!Array.isArray(parsedTokens[i])) {
                    conditions.push(this.generateClause(spec, <ISpecificationTokenGroup>parsedTokens[i]));
                } else {
                    conditions.push(this.generateWhere(spec, <SpecificationToken[]>parsedTokens[i]));
                }
            }
            return { [op]: conditions };
        }
    }
    
    private generateClause<TModel extends Model>(spec: Specification<TModel>, clause: ISpecificationTokenGroup) {
        if (clause.left === undefined) {
            return { [ this.getValue(spec, clause.right) ]: { [Op.eq]: false } };
        } else {
            return { [ this.getValue(spec, clause.left) ]: { [ this.getOperator(clause.op) ]: this.getValue(spec, clause.right) } };
        }
    }
    
    private getValue<TModel extends Model>(spec: Specification<TModel>, item?: Token): any {
        if (item !== undefined) {
            if (item.type === 'ref') {
                return item.value;
            }
            else if (item.type === 'var') {
                if (!spec.vars) throw 'Variables need to be passed in if you want to use the variable feature';
                if (spec.vars && !spec.vars.hasOwnProperty(item.value)) throw 'Variable could not be found for use in the spec';
                return spec.vars[item.value] || null;
            } else if (item.type === 'val') {
                return eval(item.value);
            }
        }
        return undefined;
    }
    
    private getOperator(op: Token): symbol {
        switch (op.type) {
            case 'and': return Op.and;
            case 'or': return Op.or;
            case 'gt': return Op.gt;
            case 'gte': return Op.gte;
            case 'lt': return Op.lt;
            case 'lte': return Op.lte;
            case 'ne': return Op.ne;
            case 'eq': return Op.eq;
            case 'not': return Op.not;
        }
        throw `Operator [${op.type}] could not be generated`;
    }
    //#endregion
}