import 'reflect-metadata';
import { Specification } from './specifications';
import { tokenizeArrowFunc } from './util';
import { Model } from './Model';

export interface IQueryOptions<TModel extends Model> {
    where?: Specification<TModel>;
    group?: string | string[] | Object;
    include?: string[];
    order?: string | string[] | Object;
    limit?: number;
    offset?: number;
}

export class Query<T extends Model> {
    public options: IQueryOptions<T> = {};

    public where(spec: Specification<T>): Query<T>;
    public where(spec: (item: T) => boolean, vars: { [key: string]: any }): Query<T>;
    public where(spec: any, vars?: any): Query<T> {
        if (!(spec instanceof Specification)) {
            spec = new Specification<T>(spec, vars);
        }
        this.options.where = spec;
        return this;
    }

    public having() {
        throw 'TODO: This needs to be figured out.';
    }

    public group(group: string | string[] | Object): Query<T> {
        this.options.group = group;
        return this;
    }

    public include<TInclude extends Model>(include: (item: T) => TInclude | TInclude[], spec?: Specification<TInclude>): Query<T> {
        let tokens = tokenizeArrowFunc(include.toString());
        if (tokens.length !== 1) throw 'Include cannot deal with multiple include statements.';
        this.options.include = this.options.include || [];

        // Deal with has many relationships
        this.options.include.push(tokens[0].value);
        return this;
    }

    public order(order: string | string[] | Object): Query<T> {
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
}