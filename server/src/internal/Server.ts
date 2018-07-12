import 'reflect-metadata';
import * as http from 'http';
import * as url from 'url';
import * as isPromise from 'is-promise';
import { IController } from '../controller';
import { IInjector } from '../injector';
import { Method, Status } from '../enums';
import { IInternalRoute, IInternalInjectedRoute, IRoute } from '../interfaces';
import { Result, JsonResult, HtmlResult } from '../results';
import { ILogger, ConsoleLogger } from '../loggers';
import { IService, Model, IModel, Connection } from '../db';

export class InternalServer {
    private _server: http.Server;
    private _routes: IInternalRoute[];
    private _injectedRoutes: IInternalInjectedRoute[];
    private _paramRegex: RegExp;
    private _actionRegex: RegExp;
    private _logger: ILogger;

    private _injectables: any[];

    private _port: Number;

    constructor(private _sqlConnection: Connection, logger?: ILogger) {
        this._server = http.createServer(this.handleRequest.bind(this));
        this._paramRegex = /{(.*)}/;
        this._actionRegex = /\[(.*)\]/;
        this._injectedRoutes = [];
        this._routes = [];
        this._port = 0;
        this._logger = logger ? logger : new ConsoleLogger();

        this._injectables = [ this._sqlConnection ];
    }

    public addControllers(...controllers: IController[]) {
        for (let i = 0; i < controllers.length; ++i) {
            let args = this.getDependencyInjections(controllers[i]);
            let controller = new controllers[i](...args);
            for (let j = 0; j < controller._routes.length; ++j) {
                let route = this.copyRoute<IInternalRoute>(controller._routes[j]);
                route.controller = controller;
                this._routes.push(route);
            }
        }
    }

    public addInjectors(...injectors: IInjector[]) {
        for (let i = 0; i < injectors.length; ++i) {
            let args = this.getDependencyInjections(injectors[i]);
            let injector = new injectors[i](...args);
            for (let j = 0; j < injector._routes.length; ++j) {
                let route = this.copyRoute<IInternalInjectedRoute>(injector._routes[j]);
                route.injector = injector;
                this._injectedRoutes.push(route);
            }
        }
    }

    public addService<T extends Model>(service: IService<T>) {
        let args = this.getDependencyInjections(service);
        args.shift();
        this._injectables.push(new service(this._sqlConnection, ...args));
    }

    public addModels(...models: IModel[]) {
        this._sqlConnection.addModels(...models);
    }

    public getDependencyInjections(item: any): any[] {
        let args: any[] = [];
        let params = Reflect.getMetadata('design:paramtypes', item);
        if (params !== undefined) {
            for (let i = 0; i < params.length; ++i) {
                let instanceIndex = this._injectables.findIndex(x => x instanceof params[i]);
                if (instanceIndex > -1) {
                    args.push(this._injectables[instanceIndex]);
                } else {
                    args.push(null);
                }
            }
        }
        return args;
    }

    private copyRoute<I extends IRoute>(oldRoute: IRoute): I {
        let route = Object.assign<I, IRoute>(<I>{}, oldRoute);

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
        this._logger.log(`Listening on port: ${this._port}`);
    }

    public close(callback?: Function) {
        this._server.close(callback);
    }

    private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        let parsedUrl = url.parse((req.url || '').substr(1));
        let routes = this.getRoutes(parsedUrl, req.method || '', this._routes);
        let injectors = this.getRoutes(parsedUrl, req.method || '', this._injectedRoutes);

        let data: any[] = [];
        req.on('data', (chunk) => {
            data.push(chunk);
        });

        req.on('end', async () => {
            let body: any = Buffer.concat(data).toString();
            if (req.headers['content-type'] === 'application/json' && body) body = JSON.parse(body);

            let response = new JsonResult();
            try {
                if (routes.length > 0) {
                    let result = await this.processRoute(routes[0], parsedUrl, body);
                    for (let i = 0; i < injectors.length; ++i) {
                        result = await this.processInjector(injectors[i], parsedUrl, body, result);
                    }

                    if (result instanceof Result) {
                        response = result;
                    } else {
                        response.body = result;
                    }
                } else {
                    response = new HtmlResult('<html><head><title>Test Title</title></head><body><div id="app"><router-view>Loading...</router-view></div><script type="text/javascript" src="/client.js"></script></body></html>');
                }
            } catch (err) {
                response.status = Status.InternalServerError;
                response.body = { message: 'Internal Server Error' };
            } finally {
                response.processResponse(res);
            }
        });
    }

    private processRoute(route: IInternalRoute, parsedUrl: url.UrlWithStringQuery, body: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let response = route.controller[route.key].apply(route.controller, this.processArguments(route, body, parsedUrl));
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
            let response = injectedRoute.injector[injectedRoute.key].call(injectedRoute.injector, result);
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

        let splitPath = parsedUrl.path === null || parsedUrl.path === undefined ? [] : parsedUrl.path.split('/');
        let fromRoute: { [key: string]: string } = {};
        for (let i = 0; i < splitPath.length; ++i) {
            let matches = route.splitPath[i].match(this._paramRegex);
            if (matches !== null) {
                fromRoute[matches[1]] = splitPath[i];
            }
        }
        let args: string[] = [];
        for (let i = 0; i < route.params.length; ++i) {
            if (body && fromRoute[route.params[i]] === undefined)args.push(body[route.params[i]]);
            else args.push(fromRoute[route.params[i]]);
        }
        return args;
    }

    private getRoutes<R extends IRoute>(parsedUrl: url.UrlWithStringQuery, method: string, allRoutes: R[]): R[] {
        let splitPath = parsedUrl.path === null || parsedUrl.path === undefined ? [] : parsedUrl.path.split('/');
        let possibleRoutes = allRoutes.filter(x => x.splitPath.length === splitPath.length);
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

        let routes: R[] = [];
        for (let i = 0; i < possibleRoutes.length; ++i) {
            let includeRoute = true;
            for (let j = 0; j < possibleRoutes[i].splitPath.length && includeRoute; ++j) {
                if (possibleRoutes[i].splitPath[j] !== splitPath[j] && possibleRoutes[i].splitPath[j].match(this._paramRegex) === null)
                    includeRoute = false;
            }
            if (includeRoute) routes.push(possibleRoutes[i]);
        }
        return routes;
    }
}