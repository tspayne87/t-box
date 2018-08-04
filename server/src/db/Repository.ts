import 'reflect-metadata';
import { Model, IModel } from './Model';
import { Query } from './Query';
import { Specification } from './specifications';
import { MODELPROPERTIES } from './declarations';

export abstract class Repository {
    protected _modelClasses: IModel<any>[] = [];

    public addModel<T extends Model>(model: IModel<T>) {
        this._modelClasses.push(model);
    }

    public model<T extends Model>(model: IModel<T>, ...args: any[]) {
        return new model(this, ...args);
    }

    public abstract initialize(): Promise<boolean>;
    public abstract listen(): Promise<boolean>;
    public abstract close(): Promise<boolean>;

    // repository hooks
    public abstract async findAll<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>);
    public abstract async findOne<TModel extends Model>(entity: IModel<TModel>, query?: Query<TModel> | Specification<TModel>);
    public abstract async save<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]);
    public abstract async destroy<TModel extends Model>(entity: IModel<TModel>, ...models: TModel[]);

    protected mapColumns<TModel extends Model>(entity: IModel<TModel>, to: TModel, from: TModel) {
        let keys = Reflect.getMetadata(MODELPROPERTIES, entity);
        for (let i = 0; i < keys.length; ++i) {
            to[keys[i]] = from[keys[i]];
        }
        return to;
    }
}