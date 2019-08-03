import 'reflect-metadata';

/**
 * Meta key used in reflect-metadata to deal with saving the query information for use later.
 */
export const queryMetaDataKey = Symbol('tbox:query');

/**
 * Attribute that will be used to determine if the query of the post should be used instead of trying to find the value
 * as a url parameter or a parameter in the query.
 * 
 * @param name The name of the query we should be using when injecting data
 */
export function Query(name: string) {
  return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    let existingQueryStrings: any[] = Reflect.getOwnMetadata(queryMetaDataKey, target, propertyKey) || [];
    existingQueryStrings.push({ name, index: parameterIndex });
    Reflect.defineMetadata(queryMetaDataKey, existingQueryStrings, target, propertyKey);
  };
}
