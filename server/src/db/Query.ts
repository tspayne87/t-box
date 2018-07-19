import 'reflect-metadata';
import { col, literal, Model as DbModel, FindOptions, IncludeOptions } from 'sequelize';
import { Specification } from './specifications';
import { HASMANY } from './decorators';
import { Connection } from './Connection';
import { tokenizeArrowFunc } from './util';
import { Model, IModel } from './Model';

export class Query<T extends Model> {
    public options: FindOptions<T> = {};

    constructor(private _db: Connection, private _constructor: IModel<T>) {
    }

    public where(spec: Specification<T>): Query<T>;
    public where(spec: (item: T) => boolean, vars: { [key: string]: any }): Query<T>;
    public where(spec: any, vars?: any): Query<T> {
        if (!(spec instanceof Specification)) {
            spec = new Specification<T>(spec, vars);
        }
        this.options.where = spec.where();
        return this;
    }

    public having() {
        throw 'TODO: This needs to be figured out.';
    }

    public group(group: string | string[] | Object): Query<T> {
        this.options.group = group;
        return this;
    }

    public distinct(distinct: boolean = false): Query<T> {
        this.options.distinct = distinct;
        return this;
    }

    public include<TInclude extends Model>(include: (item: T) => TInclude | TInclude[], spec?: Specification<TInclude>): Query<T> {
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

    public order(order: string | col | literal | Array<string | number | DbModel<any, any> | { model: DbModel<any, any>, as?: string }> | Array<string | col | literal | Array<string | number | DbModel<any, any> | { model: DbModel<any, any>, as?: string }>>): Query<T> {
        this.options.order = order;
        return this;
    }

    public limit(limit: number): Query<T> {
        this.options.limit = limit;
        return this;
    }

    public offset(offset: number): Query<T> {
        this.options.offset = offset;
        return this;
    }

    public paranoid(paranoid: boolean = true): Query<T> {
        this.options.paranoid = paranoid;
        return this;
    }
}