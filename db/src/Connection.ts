import * as Sequelize from 'sequelize';
import { Model, ModelClass, DecoratedModelClass } from './Model';

export class Connection {
    private _db!: Sequelize.Sequelize;
    private _modelClasses: DecoratedModelClass[] = [];
    private _models: { [key:string]: Sequelize.Model<any, any> } = {};

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

        for (let i = 0; i < this._modelClasses.length; ++i) {
            this._models[this._modelClasses[i].__table_name__] =
                this._db.define(this._modelClasses[i].__table_name__, this._modelClasses[i].__columns__);

            await this._models[this._modelClasses[i].__table_name__].sync({ force: true });
        }
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