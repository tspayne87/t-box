import 'reflect-metadata';
import { Method } from './enums';
import { IActionCtor } from './interfaces';

/**
 * Meta key used in reflect-metadata to deal with saving the body information for use later.
 */
export const routesMetaKey = Symbol('tbox:routes');
/**
 * Meta key used in reflect-metadata to deal with saving the body information for use later.
 */
export const beforeCallbackMetaKey = Symbol('tbox:before:callback');
/**
 * Meta key used in reflect-metadata to deal with saving the body information for use later.
 */
export const afterCallbackMetaKey = Symbol('tbox:after:callback');

/**
 * Helper function to build out the routes for the decorators and the different HTTP methods.
 * 
 * @param method The method that this route decorator should use when building out the routes for the controller.
 */
export function createRouteDecorator(method: Method): (path?: string) => (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => void {
    return (path: string = '') => {
        return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => {
            const Ctor = target.constructor;
            let existingRoutes: any[] = Reflect.getOwnMetadata(routesMetaKey, Ctor) || [];
            existingRoutes.push({ method: method, path: path, key: key, params: getParamNames(descriptor.value) });
            Reflect.defineMetadata(routesMetaKey, existingRoutes, Ctor);
        };
    };
}

/**
 * Helper function to build out the routes for the decorators and the different HTTP methods.
 * 
 * @param method The method that this route decorator should use when building out the routes for the controller.
 */
export function createBeforeActionDecorator(action: IActionCtor): (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => void {
    return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => {
        const Ctor = target.constructor;
        let existingBeforeCallbacks: any[] = Reflect.getOwnMetadata(beforeCallbackMetaKey, Ctor) || [];
        existingBeforeCallbacks.push(action);
        Reflect.defineMetadata(beforeCallbackMetaKey, existingBeforeCallbacks, Ctor, key);
    };
}

// Following is gathered from: https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
export function getParamNames(func: Function): string[] {
    if (func === undefined) return [];
    let fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}