import 'reflect-metadata';
import { Model } from '../model';

/**
 * Meta key used in reflect-metadata to deal with schema data points
 */
export const schemaMetaKey = Symbol('tbox:model:schema');

/**
 * Decorator to help build out what objects will be included in the database and
 * what they should be called.
 * @param name The name of the schema to be used in the database
 */
export function Schema(name: string): any {
    return (target: any): any => {
        Reflect.defineMetadata(schemaMetaKey, name, target);
    };
}
