import 'reflect-metadata';

import * as mongoose from 'mongoose';
import { Model, IModel } from '../model';
import { IQuery } from '../query';
import { schemaMetaKey, fieldMetaKey, IFieldMetadata } from '../decorators';
import { IRepository } from '../repository';
import { ModelHelper } from './modelHelper';
import { ServerQuery } from './serverQuery';

export class ServerRepository implements IRepository {
    private _conn?: mongoose.Connection;
    private _cache: { [key: string]: mongoose.Model<any> } = { };
    private _modelCache: { [key: string]: IModel } = { };

    public query<T extends Model>(type: string): IQuery<T> {
        return new ServerQuery(this._cache[type].find(), this._modelCache[type]);
    }

    public async save<T extends Model>(type: string, model: T): Promise<T> {
        let result: any;
        if (model._id === undefined) {
            result = await this._cache[type].create(model);
        } else {
            await this._cache[type].updateOne({ _id: new mongoose.Types.ObjectId(model._id) }, model).exec();
            result = await this._cache[type].findOne({ _id: new mongoose.Types.ObjectId(model._id) }).exec();
        }
        return ModelHelper.MapModel(this._modelCache[type], result);
    }

    public async remove<T extends Model>(type: string, model: T): Promise<boolean> {
        await this._cache[type].deleteOne({ _id: new mongoose.Types.ObjectId(model._id) }).exec();
        return true;
    }

    public async connect(uri: string) {
        this._conn = mongoose.createConnection(uri, { useNewUrlParser: true });
    }

    public async disconnect() {
        if (this._conn !== undefined) {
            return this._conn.close();
        }
    }

    public addModel(model: IModel) {
        if (this._conn !== undefined) {
            let schemaName = Reflect.getOwnMetadata(schemaMetaKey, model);
            let schemaData = this.createSchema(model);
            let schema = new mongoose.Schema(schemaData);

            this._cache[schemaName] = this._conn.model(schemaName, schema);
            this._modelCache[schemaName] = model;
        }
    }

    private createSchema(model: any, isBase: boolean = true) {
        let schemaName = Reflect.getOwnMetadata(schemaMetaKey, model);
        let fields: IFieldMetadata[] | undefined = Reflect.getOwnMetadata(fieldMetaKey, model);

        if (schemaName === undefined && fields === undefined) {
            return model;
        } else if (schemaName !== undefined && !isBase) {
            return mongoose.Schema.Types.ObjectId;
        } else if (fields !== undefined) {
            let schema: any = { };
            for (let i = 0; i < fields.length; ++i) {
                let field: any = this.createSchema(fields[i].type, false);
                if (typeof field === 'function') {
                    field = { type: field };
                    if (fields[i].ref !== undefined) field.ref = fields[i].ref;
                }

                if (fields[i].isArray) {
                    schema[fields[i].key] = [ field ];
                } else {
                    schema[fields[i].key] = field;
                }
            }
            return schema;
        }
    }
}
