import 'reflect-metadata';
import { beforeCallbackMetaKey } from '../utils';

/**
 * Attribute for controllers to give the controller route information that will be used by the server.
 * 
 * @param path The controller path that needs to be used for all the http method attributes in this class.
 */
export function BeforeAction(action: any): any {
    return (target: any, key: string, descriptor: TypedPropertyDescriptor<any>) => {
        const Ctor = target.constructor;
        let existingBeforeCallbacks: any[] = Reflect.getOwnMetadata(beforeCallbackMetaKey, Ctor) || [];
        existingBeforeCallbacks.push(action);
        Reflect.defineMetadata(beforeCallbackMetaKey, existingBeforeCallbacks, Ctor, key);
    };
}