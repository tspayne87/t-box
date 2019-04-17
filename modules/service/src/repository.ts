import { Model } from './model';
import { IQuery } from './query';

export interface IRepository {
    query<T extends Model>(type: string): IQuery<T>;
    save<T extends Model>(type: string, model: T): Promise<T>;
    remove<T extends Model>(type: string, model: T): Promise<boolean>;
}
