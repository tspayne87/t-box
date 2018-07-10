import 'reflect-metadata';
import { col, literal, Model as DbModel, FindOptions, IncludeOptions } from 'sequelize'
import { Spec } from './specs';
import { HASMANY } from './decorators';
import { Connection } from './Connection';
import { tokenizeArrowFunc } from './util';
import { Model, ModelClass } from './Model';

export class Query<T extends Model> {
    public options: FindOptions<T> = {};

    constructor(private _db: Connection, private _constructor: ModelClass<T>) {
    }

    public where(spec: Spec<T>) {
        this.options.where = spec.where();
        return this;
    }

    public having() {
        throw 'TODO: This needs to be figured out.';
    }

    public group(group: string | string[] | Object) {
        this.options.group = group;
        return this;
    }

    public distinct(distinct: boolean = false) {
        this.options.distinct = distinct;
        return this;
    }

    public include<TInclude extends Model>(include: (item: T) => TInclude | TInclude[], spec?: Spec<TInclude>) {
        let tokens = tokenizeArrowFunc(include.toString());
        if (tokens.length !== 1) throw 'Include cannot deal with multiple include statements.';
        this.options.include = this.options.include || [];

        // Deal with has many relationships
        let hasMany = Reflect.getMetadata(HASMANY, new this._constructor(), tokens[0].value);
        if (hasMany !== undefined) {
            let options: IncludeOptions = {
                model: this._db.model(hasMany.table),
                as: tokens[0].value
            };
            if (spec !== undefined) options.where = <any>spec.where();
            this.options.include.push(options);
        }
        return this;
    }

    public order(order: string | col | literal | Array<string | number | DbModel<any, any> | { model: DbModel<any, any>, as?: string }> | Array<string | col | literal | Array<string | number | DbModel<any, any> | { model: DbModel<any, any>, as?: string }>>) {
        this.options.order = order;
        return this;
    }

    public limit(limit: number) {
        this.options.limit = limit;
        return this;
    }

    public offset(offset: number) {
        this.options.offset = offset;
        return this;
    }

    public paranoid(paranoid: boolean = true) {
        this.options.paranoid = paranoid;
        return this;
    }
}