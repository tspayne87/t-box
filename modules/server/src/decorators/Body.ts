import 'reflect-metadata';

/**
 * Meta key used in reflect-metadata to deal with saving the body information for use later.
 */
export const bodyMetadataKey = Symbol('tbox:body');

/**
 * Attribute that will be used to determine if the body of the post should be used instead of trying to find the value
 * as a url parameter or a parameter in the body.
 * 
 * @param target The target this attrbiute is being bound to.
 * @param propertyKey The property on the target that is being targeted.
 * @param parameterIndex The parameter index that needs to be used in the function.
 */
export function Body(target: Object, propertyKey: string | symbol, parameterIndex: number) {
    let existingBodyParameters: number[] = Reflect.getOwnMetadata(bodyMetadataKey, target, propertyKey) || [];
    existingBodyParameters.push(parameterIndex);
    Reflect.defineMetadata(bodyMetadataKey, existingBodyParameters, target, propertyKey);
}