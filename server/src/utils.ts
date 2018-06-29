import { DecoratedControllerClass, BasicType, PathType } from './declarations';
import { Method } from './enums';

export function createRouteDecorator(method: Method): (path?: string) => (target: any, key: string, descriptor: PropertyDescriptor) => void {
    return (path: string = '') => {
        return (target: any, key: string, descriptor: PropertyDescriptor) => {
            const Ctor = target.constructor;
            Ctor.__routes__ = Ctor.__routes__ || [];
            Ctor.__routes__.push({ method: method, path: path, key: key, params: getParamNames(descriptor.value) });
        }
    }
}

// Following is gathered from: https://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
export function getParamNames(func: Function): string[] {
    if (func === undefined) return [];
    let fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
        result = [];
    return result;
}