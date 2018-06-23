import { IRoute } from './interfaces';

export class Controller {
    public _routes: IRoute[];

    public constructor() {
        this._routes = [];
    }
}