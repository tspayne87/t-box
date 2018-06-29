import { IRoute } from './interfaces';

export class Injector {
    public _routes: IRoute[];

    public constructor() {
        this._routes = [];
    }
}