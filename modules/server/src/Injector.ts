import { IRoute } from './interfaces';

export interface IInjector {
    new (...args: any[]): Injector;
    __routes__?: IRoute[];
}

export class Injector {
    public _routes: IRoute[];

    public constructor() {
        this._routes = [];
    }
}