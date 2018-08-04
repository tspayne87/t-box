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

    public async findAll(query?: Query<TModel> | Specification<TModel>) {
        return await this._repository.findAll(this._model, query);
    }

    public async findOne(query?: Query<TModel> | Specification<TModel>) {
        return await this._repository.findOne(this._model, query);
    }

    public async save(...models: TModel[]) {
        return await this._repository.save(this._model, ...models);
    }

    public async destroy(...models: TModel[]) {
        return await this._repository.destroy(this._model, ...models);
    }
}