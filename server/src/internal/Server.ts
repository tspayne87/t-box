import 'reflect-metadata';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import * as isPromise from 'is-promise';
import * as Sequelize from 'sequelize';
import { IController } from '../controller';
import { IInjector } from '../injector';
import { Method, Status } from '../enums';
import { IInternalRoute, IInternalInjectedRoute, IRoute } from '../interfaces';
import { Result, JsonResult, HtmlResult, JavascriptResult, CssResult } from '../results';
import { ILogger, ConsoleLogger } from '../loggers';
import { IService, Model, IModel, Connection } from '../db';
import { resolve } from 'dns';

export class InternalServer {
    private _server: http.Server;
    private _staticFolders: string[][];
    private _routes: IInternalRoute[];
    private _injectedRoutes: IInternalInjectedRoute[];
    private _paramRegex: RegExp;
    private _actionRegex: RegExp;
    private _jsRegex: RegExp;
    private _cssRegex: RegExp;
    private _faviconRegex: RegExp;
    private _logger: ILogger;
    private _sqlConnection: Connection;
    private _injectables: any[];

    public indexFile: string;

    constructor(private _sqlConnectionOptions: Sequelize.Options, private _dir: string, logger?: ILogger) {
        this._server = http.createServer(this.handleRequest.bind(this));
        this._paramRegex = /{(.*)}/;
        this._actionRegex = /\[(.*)\]/;
        this._jsRegex = /\.js$/;
        this._cssRegex = /\.css$/;
        this._faviconRegex = /favicon\.icon$/;
        this._injectedRoutes = [];
        this._staticFolders = [];
        this._routes = [];
        this._logger = logger ? logger : new ConsoleLogger();
        this.indexFile = 'index.html';

        this._sqlConnection = new Connection();
        this._injectables = [ this._sqlConnection ];
    }

    public addControllers(...controllers: IController[]) {
        for (let i = 0; i < controllers.length; ++i) {
            let args = this.getDependencyInjections(controllers[i]);
            args.shift();
            let controller = new controllers[i](this._sqlConnection, ...args);
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

    public addModel<T extends Model>(model: IModel<T>) {
        this._sqlConnection.addModel(model);
    }

    public registerStaticLocations(...folders: string[]) {
        this._staticFolders = this._staticFolders.concat(folders.map(x => x.split('/')));
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

    public async listen(...args: any[]) {
        await this._sqlConnection.listen(this._sqlConnectionOptions);
        this._server.listen.apply(this._server, args);
    }

    public async close(callback?: Function) {
        await this._sqlConnection.close();
        this._server.close(callback);
    }

    private handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
        let parsedUrl = url.parse((req.url || '').substr(1), true);
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
                    if (this.isStaticResource(parsedUrl)) {
                        response = await this.getStaticResult(parsedUrl);
                    } else {
                        let index = await this.readIndex();
                        response = new HtmlResult(index);
                    }
                }
            } catch (err) {
                this._logger.error(err);
                response.status = Status.InternalServerError;
                response.body = { message: 'Internal Server Error' };
            } finally {
                response.processResponse(res);
            }
        });
    }

    private async getStaticResult(parsedUrl: url.UrlWithParsedQuery): Promise<Result> {
        let currentPath = parsedUrl.pathname === undefined || parsedUrl.pathname === null ? '' : parsedUrl.pathname;
        let contents = await this.readFile(currentPath);
        if (this._jsRegex.test(currentPath)) {
            return new JavascriptResult(contents);
        } else if (this._cssRegex.test(currentPath)) {
            return new CssResult(contents);
        }

        let result = new Result();
        result.body = contents;
        return result;
    }

    private readIndex() {
        return this.readFile(this.indexFile);
    }

    private readFile(filePath: string) {
        return new Promise<string>((resolve, reject) => {
            fs.readFile(path.join(this._dir, filePath), 'utf8', (err, data) => {
                if (err) return reject(err);
                resolve(data);
            });
        });
    }

    private processRoute(route: IInternalRoute, parsedUrl: url.UrlWithParsedQuery, body: any): Promise<any> {
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

    private processInjector(injectedRoute: IInternalInjectedRoute, parsedUrl: url.UrlWithParsedQuery, body: any, result: any): Promise<any> {
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

    /**
     * Method is meant to process argument so they can be passed into the route properly.
     * @param route The current route that needs its arguments parsed.
     * @param body The current body of the request that was sent.
     * @param parsedUrl The parsed url with the query parameters parsed.
     */
    private processArguments(route: IInternalRoute, body: any, parsedUrl: url.UrlWithParsedQuery): any[] {
        if (route.params.length === 0) return []; // If no parameters were found on the route we do not need to process anything.
        if (route.params.length === 1 && body) return [ body ]; // If only one property was found and a body exists we need to process only the body.

        // We need to iterate over the url and get the data elements from the url to be parsed properly.
        let splitPath = parsedUrl.pathname === undefined || parsedUrl.pathname === null ? [] : parsedUrl.pathname.split('/');
        let fromRoute: { [key: string]: string } = {};
        for (let i = 0; i < splitPath.length; ++i) {
            let matches = route.splitPath[i].match(this._paramRegex);
            if (matches !== null) {
                fromRoute[matches[1]] = splitPath[i];
            }
        }

        // Create the argument array that will be used when parsing the route.
        let argTypes = Reflect.getMetadata('design:paramtypes', route.controller, route.key);
        let args: any[] = [];
        for (let i = 0; i < route.params.length; ++i) {
            let param = parsedUrl.query[route.params[i]];
            if (param !== undefined) {
                if (Array.isArray(param)) {
                    let list: any[] = [];
                    for (let j = 0; j < param.length; ++j) {
                        list.push(this.processArgument(argTypes[i], param[j]));
                    }
                    args.push(list);
                } else {
                    args.push(this.processArgument(argTypes[i], param));
                }
            } else if (body && fromRoute[route.params[i]] === undefined) {
                args.push(this.processArgument(argTypes[i], body[route.params[i]]));
            } else {
                args.push(this.processArgument(argTypes[i], fromRoute[route.params[i]]));
            }
        }
        return args;
    }

    private processArgument(type: any, value: string) {
        switch (type) {
            case Number:
                return parseFloat(value);
            case String:
                return value;
            case Boolean:
                return value === '1' || value === 'true';
        }
        return type(value);
    }

    private isStaticResource(parsedUrl: url.UrlWithParsedQuery) {
        let splitPath = parsedUrl.pathname === undefined || parsedUrl.pathname === null ? [] : parsedUrl.pathname.split('/');
        for (let i = 0; i < this._staticFolders.length; ++i) {
            let isStaticResource = true;
            for (let j = 0; j < this._staticFolders[i].length && isStaticResource; ++j) {
                isStaticResource = isStaticResource && this._staticFolders[i][j] === splitPath[j];
            }
            if (isStaticResource) return true;
        }
        return false;
    }

    private isFavicon(parsedUrl: url.UrlWithParsedQuery) {
        return parsedUrl.pathname !== null && parsedUrl.pathname !== undefined && this._faviconRegex.test(parsedUrl.pathname);
    }

    private getRoutes<R extends IRoute>(parsedUrl: url.UrlWithParsedQuery, method: string, allRoutes: R[]): R[] {
        let splitPath = parsedUrl.pathname === undefined || parsedUrl.pathname === null ? [] : parsedUrl.pathname.split('/');
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