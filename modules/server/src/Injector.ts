import { IRoute, IInternalInjectedRoute } from './interfaces';

/**
 * Injector class is the placeholder for all injectors
 */
export class Injector {
    /**
     * The routes that will be used in the internal server to call various methods on the injector classes.
     */
    public _routes: IRoute[];

    /**
     * Basic constructor to set an array to the routes list.
     */
    public constructor() {
        this._routes = [];
    }
}