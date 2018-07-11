import { Controller } from './Controller';
import { Injector } from './Injector';
import { IRoute } from './interfaces';

export type ControllerClass<C> = { new (...args: any[]): C & Controller } & typeof Controller;

export type DecoratedControllerClass = ControllerClass<Controller> & {
    __routes__?: IRoute[]
};

export type InjectorClass<C> = { new (...args: any[]): C & Injector } & typeof Injector;

export type DecoratedInjectorClass = InjectorClass<Injector> & {
    __routes__?: IRoute[]
};

export type BasicType = () => (target: any, key: string) => void;
export type PathType = (path: string) => (target: any, key: string) => void;