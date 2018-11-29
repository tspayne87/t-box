import 'reflect-metadata';
import { ENTITY } from '../declarations';

export function Entity(name: string): any {
    return (target: any): any => {
        Reflect.defineMetadata(ENTITY, name, target);
        return target;
    };
}