import { IRoute, IRouteTree } from '../interfaces';
import { Method } from '../enums';
import * as url from 'url';

/**
 * Helper class to store the route items for further use.
 */
export class RouteContainer<T extends IRoute> {
    /**
     * The tree structure for the route container.
     */
    private _tree: IRouteTree<T>;
    /**
     * The parameter key that should be used to group wild cards in the 
     */
    private _paramKey: string;
    /**
     * The action regex that will replace a segment of the url with the name of the method it is attached from.
     */
    public actionRegex: RegExp;
    /**
     * The parameter regex that should be used to pass arguments from the url into the methods on the controllers.
     */
    public paramRegex: RegExp;

    /**
     * Constructor to build out a route container.
     */
    constructor() {
        this._tree = { children: {}, routes: [] };
        this.paramRegex = /{(.*)}/;
        this.actionRegex = /\[(.*)\]/;
        this._paramKey = '___param_key___';
    }

    /**
     * Method will add the route to the container.
     * 
     * @param route The route that needs to be added to the tree structure.
     */
    public push(route: T): T {
        let copied = this.copyRoute(route);
        let tree = this._tree;
        for (let i = 0; i < copied.splitPath.length; ++i) {
            let key = copied.splitPath[i];
            if (this.paramRegex.test(key)) key = this._paramKey;
            if (tree.children[key] === undefined) tree.children[key] = { children: {}, routes: [] };
            tree = tree.children[key];
        }
        tree.routes.push(copied);
        return copied;
    }

    /**
     * Helper method to get the routes for a particular url.
     * 
     * @param parsedUrl The parsed url from the client.
     * @param method The current method of the request.
     */
    public find(parsedUrl: url.UrlWithParsedQuery, method: string): T[] {
        let splitPath = parsedUrl.pathname === undefined || parsedUrl.pathname === null ? [] : parsedUrl.pathname.split('/');

        let possibleRoutes: T[] = [];
        if (splitPath.length > 0) {
            let wildCards: T[] = [];
            let leaf = this._tree;
            let parameterLeaf: IRouteTree<T> | undefined;
            for (let i = 0; i < splitPath.length; ++i) {
                let key = splitPath[i];
                let next = leaf.children[key];
                if (next === undefined && parameterLeaf !== undefined) {
                    if (leaf.children[this._paramKey] !== undefined) {
                        next = parameterLeaf.children[this._paramKey];
                    } else if (parameterLeaf.children[key] !== undefined) {
                        next = parameterLeaf.children[key];
                    } else {
                        leaf = { children: {}, routes: [] };
                        break;
                    }
                }

                parameterLeaf = leaf.children[this._paramKey];
                if (next === undefined && parameterLeaf !== undefined) {
                    next = parameterLeaf;
                    parameterLeaf = undefined;
                }
                if (leaf.children['*'] !== undefined)
                    wildCards = leaf.children['*'].routes.concat(wildCards);

                if (next === undefined) {
                    leaf = { children: {}, routes: [] };
                    break;
                }
                leaf = next;
            }
            possibleRoutes = leaf.routes.concat(wildCards);
        } else if (this._tree.children['*'] !== undefined) {
            possibleRoutes = this._tree.children['*'].routes;
        }

        switch (method) {
            case 'GET':
                return possibleRoutes.filter(x => x.method === Method.Get);
            case 'POST':
                return possibleRoutes.filter(x => x.method === Method.Post);
            case 'DELETE':
                return possibleRoutes.filter(x => x.method === Method.Delete);
            case 'PUT':
                return possibleRoutes.filter(x => x.method === Method.Put);
            case 'PATCH':
                return possibleRoutes.filter(x => x.method === Method.Patch);
        }
        return possibleRoutes;
    }

    /**
     * Method is meant to copy a route and process it for use by the server.
     * 
     * @param oldRoute The old route that is being copied.
     */
    private copyRoute(oldRoute: IRoute) {
        let route = Object.assign<T, IRoute>(<T>{}, oldRoute);

        // Override some of the actions to deal with different exceptions.
        for (let i = 0; i < route.splitPath.length; ++i) {
            let matches = route.splitPath[i].match(this.actionRegex);
            if (matches !== null) {
                switch (matches[1]) {
                    case 'action':
                        route.splitPath[i] = route.key;
                        break;
                }
            }
        }
        return route;
    }
}