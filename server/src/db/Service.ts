import { FindOptions } from 'sequelize';
import { ModelByIdSpecification, Specification } from './specifications';
import { Query } from './Query';
import { Model, IModel } from './Model';
import { Connection } from './Connection';

export interface IService<T extends Model> {
    new (connection: Connection, ...args: any[]): Service<T>;
}

export abstract class Service<TModel extends Model> {
    protected abstract _model: IModel;

    private get Model() { return this._connection.model<TModel>((<any>this._model).__table_name__); }

    public constructor(private _connection: Connection) {
    }

    public async findAll(query?: Query<TModel> | Specification<TModel>) {
        if (query === undefined) {
            return await this.Model.findAll();
        } else if (query instanceof Query) {
            return await this.Model.findAll(query.options);
        } else if (query instanceof Specification) {
            return await this.Model.findAll({ where: query.where() });
        }
        return [];
    }

    public async findOne(query?: Query<TModel> | Specification<TModel>) {
        if (query === undefined) {
            return await this.Model.findOne();
        } else if (query instanceof Query) {
            return await this.Model.findOne(query.options);
        } else if (query instanceof Specification) {
            return await this.Model.findOne({ where: query.where() });
        }
        return null;
    }

    public async save(...models: TModel[]) {
        let savedModels: TModel[] = [];
        for (let i = 0; i < models.length; ++i) {
            let model = await this.findOne(new ModelByIdSpecification<TModel>(models[i].id));
            if (model === null) {
                savedModels.push(await this.Model.create(models[i]));
            } else {
                model = this.mapColumns(model, models[i]);
                savedModels.push(await (<any>model).save());
            }
        }
        return savedModels;
    }

    public async destroy(...models: TModel[]) {
        for (let i = 0; i < models.length; ++i) {
            let model = await this.findOne(new ModelByIdSpecification<TModel>(models[i].id));
            if (model !== null) {
                await (<any>model).destroy();
            }
        }
        return true;
    }

    private mapColumns(to: TModel, from: TModel) {
        let keys = Object.keys((<any>this._model).__columns__);
        for (let i = 0; i < keys.length; ++i) {
            to[keys[i]] = from[keys[i]];
        }
        return to;
    }
}