import { Specification } from '@t-box/specification';
import { Model } from './model';

interface WhereFunc<T extends Model> {
    (func?: (item: T) => boolean, data?: { [key: string]: any }): IQuery<T>;
    (spec?: Specification<T>): IQuery<T>;
}

export interface IQuery<T extends Model> {
    populate(field: (item: T) => any): IQuery<T>;
    where: WhereFunc<T>;
    sort(): IQuery<T>;
    skip(skip: number): IQuery<T>;
    size(size: number): IQuery<T>;
    toArray(): Promise<T[]>;
    first(): Promise<T | null>;
}
