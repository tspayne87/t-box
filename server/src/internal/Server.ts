import * as http from 'http';
import * as url from 'url';
import * as isPromise from 'is-promise';
import { Controller } from '../controller';
import { Injector } from '../injector';
import { Method, Status } from '../enums';
import { IInternalRoute, IInternalInjectedRoute, IRoute } from '../interfaces';
import { Result, JsonResult } from '../results';
import { ILogger } from '../loggers';

export class InternalServer {
    private _server: http.Server;
    private _routes: IInternalRoute[];
    private _injectedRoutes: IInternalInjectedRoute[];
    private _paramRegex: RegExp;
    private _actionRegex: RegExp;
    private _logger?: ILogger;

    private _port: Number;

    constructor(logger?: ILogger) {
        this._server = http.createServer(this.handleRequest.bind(this));
        this._paramRegex = /{(.*)}/;
        this._actionRegex = /\[(.*)\]/;
        this._injectedRoutes = [];
        this._routes = [];
        this._port = 0;
        this._logger = logger;
    }

    public addControllers(...controllers: Controller[]) {
        for (let i = 0; i < controllers.length; ++i) {
            for (let j = 0; j < controllers[i]._routes.length; ++j) {
                var route = this.copyRoute<IInternalRoute>(controllers[i]._routes[j]);
                route.controller = controllers[i];
                this._routes.push(route);
            }
        }
    }

    public addInjectors(...injectors: Injector[]) {
        for (let i = 0; i < injectors.length; ++i) {
            for (let j = 0; j < injectors[i]._routes.length; ++j) {
                var route = this.copyRoute<IInternalInjectedRoute>(injectors[i]._routes[j]);
                route.injector = injectors[i];
                this._injectedRoutes.push(route);
            }
        }
    }

    private copyRoute<I extends IRoute>(oldRoute: IRoute): I {
        var route = Object.assign<I, IRoute>(<I>{}, oldRoute);

        // Over-ride some of hte actions to deal with different exceptions.
        for (let i = 0; i < route.splitPath.length; ++i) {
            let matches = route.splitPath[i].match(this._actionRegex);
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

    public listen(...args: any[]) {
        this._port = args[0];
        this._server.listen.apply(this._server, args);
        this.log(`Listening on port: ${this._port}`);
    }

    public close(callback?: Function) {
        this._server.close(callback);
    }

    private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        var parsedUrl = url.parse((req.url || '').substr(1));
        var routes = this.getRoutes(parsedUrl, req.method || '', this._routes);
        var injectors = this.getRoutes(parsedUrl, req.method || '', this._injectedRoutes);

        let data: any[] = [];
        req.on('data', (chunk) => {
            data.push(chunk);
        });

        req.on('end', async () => {
            let body: any = Buffer.concat(data).toString();
            if (req.headers["content-type"] === 'application/json' && body) body = JSON.parse(body);

            var response = new JsonResult();
            try {
                if (routes.length > 0) {
                    var result = await this.processRoute(routes[0], parsedUrl, body);
                    for (let i = 0; i < injectors.length; ++i) {
                        result = await this.processInjector(injectors[i], parsedUrl, body, result);
                    }

                    if (result instanceof Result) {
                        response = result;
                    } else {
                        response.body = result;
                    }
                } else {
                    response.status = Status.BadRequest;
                    response.body = { message: 'Route could not be found' };
                }
            } catch(err) {
                response.status = Status.InternalServerError;
                response.body = { message: 'Internal Server Error' };
            } finally {
                response.processResponse(res);
            }
        });
    }

    private processRoute(route: IInternalRoute, parsedUrl: url.UrlWithStringQuery, body: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var response = route.controller[route.key].apply(route.controller, this.processArguments(route, body, parsedUrl));
            if (isPromise(response)) {
                response
                    .then(result => resolve(result))
                    .catch(err => reject(err));
            } else {
                resolve(response);
            }
        });
    }

    private processInjector(injectedRoute: IInternalInjectedRoute, parsedUrl: url.UrlWithStringQuery, body: any, result: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var response = injectedRoute.injector[injectedRoute.key].call(injectedRoute.injector, result);
            if (isPromise(response)) {
                response
                    .then(result => resolve(result))
                    .catch(err => reject(err));
            } else {
                resolve(response);
            }
        });
    }

    private processArguments(route: IInternalRoute, body: any, parsedUrl: url.UrlWithStringQuery): string[] {
        if (route.params.length === 0) return [];
        if (route.params.length === 1 && body) return [ body ];

        var splitPath = parsedUrl.path === null || parsedUrl.path === undefined ? [] : parsedUrl.path.split('/');
        var fromRoute: { [key: string]: string } = {};
        for (let i = 0; i < splitPath.length; ++i) {
            var matches = route.splitPath[i].match(this._paramRegex);
            if (matches !== null) {
                fromRoute[matches[1]] = splitPath[i];
            }
        }
        var args: string[] = [];
        for (let i = 0; i < route.params.length; ++i) {
            if (body && fromRoute[route.params[i]] === undefined)args.push(body[route.params[i]]);
            else args.push(fromRoute[route.params[i]]);
        }
        return args;
    }

    private getRoutes<R extends IRoute>(parsedUrl: url.UrlWithStringQuery, method: string, allRoutes: R[]): R[] {
        var splitPath = parsedUrl.path === null || parsedUrl.path === undefined ? [] : parsedUrl.path.split('/');
        var possibleRoutes = allRoutes.filter(x => x.splitPath.length == splitPath.length);
        switch (method) {
            case 'GET':
                possibleRoutes = possibleRoutes.filter(x => x.method === Method.Get);
                break;
            case 'POST':
                possibleRoutes = possibleRoutes.filter(x => x.method === Method.Post);
                break;
            case 'DELETE':
                possibleRoutes = possibleRoutes.filter(x => x.method === Method.Delete);
                break;
        }

        var routes: R[] = [];
        for (let i = 0; i < possibleRoutes.length; ++i) {
            var includeRoute = true;
            for (let j = 0; j < possibleRoutes[i].splitPath.length && includeRoute; ++j) {
                if (possibleRoutes[i].splitPath[j] !== splitPath[j] && possibleRoutes[i].splitPath[j].match(this._paramRegex) === null)
                    includeRoute = false;
            }
            if (includeRoute) routes.push(possibleRoutes[i]);
        }
        return routes;
    }

    private log(message: string): void {
        if (this._logger !== undefined && this._logger !== undefined) {
            this._logger.log(message);
        }
    }
}