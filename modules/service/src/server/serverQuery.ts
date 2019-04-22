import { Specification } from '@t-box/specification';
import * as mongoose from 'mongoose';
import { IQuery } from '../query';
import { Model } from '../model';
import { ModelHelper } from './modelHelper';

export class ServerQuery<T extends Model> implements IQuery<T> {
    private _query: mongoose.Query<any>;
    private _model: any;

    public constructor(query: mongoose.Query<any>, model: any) {
        this._query = query;
        this._model = model;
    }

    public populate(field: (item: T) => any): IQuery<T> {
        let fakeModel = ModelHelper.CreatePathModel(this._model);
        let result = field(fakeModel);

        if (Array.isArray(result)) {
            this._query = this._query.populate(result[1]);
        } else if (typeof result === 'object' && result.__fieldPath !== undefined) {
            this._query = this._query.populate(result.__fieldPath);
        } else if (typeof result === 'string') {
            this._query = this._query.populate(result);
        }
        return this;
    }

    public where(): IQuery<T> {
        if (arguments.length === 1) {
            let spec = arguments[0];
            if (!(arguments[0] instanceof Specification)) {
                spec = new Specification<T>(arguments[0]);
            }
            this._query = this._query.where(spec.query());
        } else if (arguments.length === 2) {
            let spec = new Specification<T>(arguments[0], arguments[1]);
            this._query = this._query.where(spec.query());
        }
        return this;
    }

    public sort(): IQuery<T> {
        this._query = this._query.sort('');
        return this;
    }

    public skip(skip: number): IQuery<T> {
        this._query = this._query.skip(skip);
        return this;
    }

    public size(size: number): IQuery<T> {
        this._query = this._query.size(size);
        return this;
    }

    public async toArray(): Promise<T[]> {
        return ModelHelper.MapModel(this._model, await this._query.exec());
    }

    public async first(): Promise<T | null> {
        return ModelHelper.MapModel(this._model, await this._query.findOne().exec());
    }
}
