import 'reflect-metadata';
import * as Mongoose from 'mongoose';
import { Repository } from '../../Repository';
import { Model, IModel } from '../../Model';
import { MODELPROPERTIES } from '../../declarations';
import { Query } from '../../Query';
import { Specification, ModelByIdSpecification } from '../../specifications';
import { SpecificationToken, ISpecificationTokenGroup } from '../../specifications/Specification';
import { Token } from '../../lexor';

export class MongooseRepository extends Repository {
    private _db!: Mongoose.Connection;

    public constructor(private _uri: string, private _options?: Mongoose.ConnectionOptions) {
        super();
    }

    public async initialize() {
        // Define all the models before adding in relationships.
        let models: { [key: string]: Mongoose.Schema } = {};
        for (let i = 0; i < this._modelClasses.length; ++i) {
            let Model = this._modelClasses[i];
            let props = Reflect.getMetadata(MODELPROPERTIES, Model);
            let model = new Model(this);

            let fields: { [key: string]: Mongoose.SchemaDefinition } = {};
            for (let i = 0; i < props.length; ++i) {
                if (model instanceof props[i].constructor) {
                    let fieldType = Model.getFieldType(props[i].property);
                    if (Array.isArray(fieldType)) {
                        if ((<any>fieldType[0]).entityName) {
                            fields[props[i].property] = <any>[{
                                type: Mongoose.Schema.Types.ObjectId,
                                ref: (<any>fieldType[0]).entityName
                            }];
                        } else {
                            
                        }
                    } else {
                        switch (fieldType) {
                            case String:
                                fields[props[i].property] = { type: String };
                                break;
                            case Number:
                                fields[props[i].property] = { type: Number };
                                break;
                            case Boolean:
                                fields[props[i].property] = { type: Boolean };
                                break;
                            case Date:
                                fields[props[i].property] = { type: Date };
                                break;
                            default:
                                if ((<any>fieldType).entityName !== undefined) {
                                    fields[props[i].property] = {
                                        type: Mongoose.Schema.Types.ObjectId,
                                        ref: (<any>fieldType[0]).entityName
                                    };
                                }
                                break;
                        }
                    }
                }
            }
            models[Model.entityName] = new Mongoose.Schema(fields);
        }
        return true;
    }

    public async listen() {
        this._db = await Mongoose.createConnection(this._uri, this._options);
        return await this.initialize();
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
        // let Model = this._db.model<TModel, any>(entity.entityName);
        // if (query === undefined) {
        //     return await Model.findAll();
        // } else if (query instanceof Query) {
        //     return await Model.findAll(this.parseQuery(entity, query));
        // } else if (query instanceof Specification) {
        //     return await Model.findAll({ where: this.parseSpecification(query) });
        // }
        return [];
    }

    public async findOne<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>): Promise<TModel | null> {
        // let Model = this._db.model<TModel, any>(entity.entityName);
        // if (query === undefined) {
        //     return await Model.findOne();
        // } else if (query instanceof Query) {
        //     return await Model.findOne(this.parseQuery(entity, query));
        // } else if (query instanceof Specification) {
        //     return await Model.findOne({ where: this.parseSpecification(query) });
        // }
        return null;
    }

    public async save<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]) {
        // let Model = this._db.model<TModel, any>(entity.entityName);

        // let savedModels: TModel[] = [];
        // for (let i = 0; i < models.length; ++i) {
        //     let model = await this.findOne(entity, new ModelByIdSpecification<TModel>(models[i].id));
        //     if (model === null) {
        //         savedModels.push(this.mapColumns(entity, (await Model.create(models[i])), new entity(this)));
        //     } else {
        //         model = this.mapColumns(entity, model, models[i]);
        //         savedModels.push(this.mapColumns(entity, (await (<any>model).save()), model));
        //     }
        // }
        // return savedModels;
        return [];
    }

    public async destroy<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]) {
        // for (let i = 0; i < models.length; ++i) {
        //     let model = await this.findOne(entity, new ModelByIdSpecification<TModel>(models[i].id));
        //     if (model !== null) {
        //         await (<any>model).destroy();
        //     }
        // }
        return true;
    }
}