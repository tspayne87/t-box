import 'reflect-metadata';
import * as Sequelize from 'sequelize';
import { COLUMN, HASMANY } from './decorators';
import { MODELPROPERTIES } from './util';
import { Model, ModelClass, DecoratedModelClass } from './Model';

export class Connection {
    private _db!: Sequelize.Sequelize;
    private _modelClasses: DecoratedModelClass[] = [];
    private _models: { [key: string]: Sequelize.Model<any, any> } = {};

    public addModels(...models: ModelClass<any>[]) {
        for (let i = 0; i < models.length; ++i) {
            this._modelClasses.push(<any>models[i]);
        }
    }

    public model<TModel>(model: string): Sequelize.Model<TModel, any> {
        return this._models[model];
    }

    public async listen(options: Sequelize.Options) {
        this._db = new Sequelize(options);

        // Define all the models before adding in relationships.
        for (let i = 0; i < this._modelClasses.length; ++i) {
            let ModelClass = this._modelClasses[i];
            let model = new ModelClass();
            let properties = Reflect.getMetadata(MODELPROPERTIES, model);
            let fields: any = {};
            for (let j = 0; j < properties.length; ++j) {
                if (model instanceof properties[j].constructor) {
                    let field = Reflect.getMetadata(COLUMN, model, properties[j].property);
                    if (field !== undefined) {
                        fields[properties[j].property] = field;
                    }
                }
            }
            this._models[ModelClass.__table_name__] = this._db.define<any, any>(ModelClass.__table_name__, fields);
        }

        // Build out relationships and sync the models together.
        for (let i = 0; i < this._modelClasses.length; ++i) {
            let ModelClass = this._modelClasses[i];
            let model = new ModelClass();
            let properties = Reflect.getMetadata(MODELPROPERTIES, model);
            for (let j = 0; j < properties.length; ++j) {
                if (model instanceof properties[j].constructor) {
                    let hasMany = Reflect.getMetadata(HASMANY, model, properties[j].property);
                    if (hasMany !== undefined) {
                        // Deals with the many link from table to table.
                        this._models[ModelClass.__table_name__].hasMany(this._models[hasMany.table], hasMany.options);
                    }
                }
            }
        }
        await this._db.sync();
    }

    public close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (this._db) {
                this._db.close()
                    .then(() => resolve())
                    .catch(err => reject(err));
            } else {
                resolve();
            }
        });
    }
}