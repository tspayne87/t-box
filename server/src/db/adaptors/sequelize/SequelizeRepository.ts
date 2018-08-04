import 'reflect-metadata';
import * as Sequelize from 'sequelize';
import { Repository } from '../../Repository';
import { Model, IModel } from '../../Model';
import { MODELPROPERTIES, FIELDOPTIONS, FIELDTYPE, ENTITY } from '../../declarations';
import { Query } from '../../Query';
import { Specification, ModelByIdSpecification } from '../../specifications';
import { parseSpecification, parseQuery } from './specification.parser';

export class SequelizeRepository extends Repository {
    private _db!: Sequelize.Sequelize;

    public constructor(private _options: Sequelize.Options) {
        super();
    }

    public async initialize() {
        this._db = new Sequelize(this._options);

        // Define all the models before adding in relationships.
        let manyMappings: { [key: string]: string } = {};
        let singleMappings: { [key: string]: string } = {};
        for (let i = 0; i < this._modelClasses.length; ++i) {
            let Model = this._modelClasses[i];
            let props = Reflect.getMetadata(MODELPROPERTIES, Model);
            let model = new Model();

            let fields: { [key: string]: Sequelize.DefineAttributeColumnOptions } = {};
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
                                if (options.autoIncrement) fields[props[i].property].autoIncrement = true;
                            }
                        }
                    }
                }
            }
            if (Object.keys(fields).length > 0) {
                this._db.define<any, any>(Model.entityName, fields);
            }
        }

        // Add in single relationships
        if (Object.keys(singleMappings).length > 0) {
            // TODO: Deal with single mappings
        }

        // Add in many relationships
        if (Object.keys(manyMappings).length > 0) {
            // TODO: Deal with many mappings
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
            return await Model.findAll(parseQuery(query));
        } else if (query instanceof Specification) {
            return await Model.findAll({ where: parseSpecification(query) });
        }
        return [];
    }

    public async findOne<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>) {
        let Model = this._db.model<TModel, any>(entity.entityName);
        if (query === undefined) {
            return await Model.findOne();
        } else if (query instanceof Query) {
            return await Model.findOne(parseQuery(query));
        } else if (query instanceof Specification) {
            return await Model.findOne({ where: parseSpecification(query) });
        }
        return null;
    }

    public async save<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]) {
        let Model = this._db.model<TModel, any>(entity.entityName);

        let savedModels: TModel[] = [];
        for (let i = 0; i < models.length; ++i) {
            let model = await this.findOne(entity, new ModelByIdSpecification<TModel>(models[i].id));
            if (model === null) {
                savedModels.push(await Model.create(models[i]));
            } else {
                model = this.mapColumns(entity, model, models[i]);
                savedModels.push(await (<any>model).save());
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
}