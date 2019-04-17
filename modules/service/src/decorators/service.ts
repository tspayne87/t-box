import 'reflect-metadata';
import { IModel } from '../model';

/**
 * Meta key used in reflect-metadata to deal with schema data points
 */
export const serviceMetaKey = Symbol('tbox:model:service');

/**
 * Decorator to help build out what objects will be included in the database and
 * what they should be called.
 * @param name The name of the schema to be used in the database
 */
export function Service(model: IModel): any {
    return (target: any): any => {
        Reflect.defineMetadata(serviceMetaKey, model, target);
    };
}
