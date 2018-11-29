import 'reflect-metadata';
import { Specification } from './specifications';
import { Query } from './Query';
import { Model, IModel } from './Model';
import { Repository } from './Repository';

export interface IService<T extends Model> {
    new (repository: Repository, ...args: any[]): Service<T>;
}

export abstract class Service<TModel extends Model> {
    protected abstract _model: IModel<TModel>;

    public constructor(private _repository: Repository) {
    }

    public findAll(query?: Query<TModel> | Specification<TModel>): Promise<TModel[]> {
        return this._repository.findAll(this._model, query);
    }

    public findOne(query?: Query<TModel> | Specification<TModel>): Promise<TModel | null> {
        return this._repository.findOne(this._model, query);
    }

    public save(...models: TModel[]): Promise<TModel[]> {
        return this._repository.save(this._model, ...models);
    }

    public destroy(...models: TModel[]): Promise<boolean> {
        return this._repository.destroy(this._model, ...models);
    }
}