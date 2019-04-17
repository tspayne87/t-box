import 'reflect-metadata';
import { schemaMetaKey } from './schema';

/**
 * Meta key used in reflect-metadata to deal with field data points
 */
export const fieldMetaKey = Symbol('tbox:model:field');

/**
 * Metadata that is stored for the field information
 */
export interface IFieldMetadata {
    key: string;
    ref?: string;
    type: Function;
    isArray: boolean;
}

/**
 * Decorator to help define a model in a mongoose database
 * @param type The type that this field should use during creation
 */
export function Field(type: Function | null = null): (target: any, key: string) => void {
    return function (target: any, key: string) {
        let currentType = Reflect.getMetadata('design:type', target, key);
        if (type === null) type = currentType;
        if (type === Array) throw new Error('Array type cannot be used as a field please include the type as the first argument for this decorator');

        const Ctor = target.constructor;
        let fields: IFieldMetadata[] = Reflect.getOwnMetadata(fieldMetaKey, Ctor) || [];
        fields.push({
            key,
            type: type as Function,
            isArray: currentType === Array,
            ref: Reflect.getMetadata(schemaMetaKey, type as Function)
        });
        Reflect.defineMetadata(fieldMetaKey, fields, Ctor);
    };
}
