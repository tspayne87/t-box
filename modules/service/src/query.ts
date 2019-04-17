import { Model } from './model';

export interface IQuery<T extends Model> {
    populate(field: (item: T) => any): IQuery<T>;
    where(): IQuery<T>;
    sort(): IQuery<T>;
    skip(skip: number): IQuery<T>;
    size(size: number): IQuery<T>;
    toArray(): Promise<T[]>;
    first(): Promise<T | null>;
}
