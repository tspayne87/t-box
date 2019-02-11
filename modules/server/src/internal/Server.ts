import 'reflect-metadata';
import * as http2 from 'http2';
import * as http from 'http';
import * as path from 'path';
import * as url from 'url';
import * as isPromise from 'is-promise';
import { IController, Controller } from '../Controller';
import { IInjector } from '../Injector';
import { Status } from '../enums';
import { IInternalRoute, IInternalInjectedRoute, IRoute } from '../interfaces';
import { Result, JsonResult, AssetResult } from '../results';
import { ILogger, ConsoleLogger } from '../loggers';
import { IncomingForm } from 'formidable';
import { IFormModel } from './IFormModel';
import { FileContainer, UploadFile } from './UploadFile';
import { Dependency } from '../Dependency';
import { bodyMetadataKey } from '../decorators';
import { RouteContainer } from './RouteContainer';
import { ServerRequestWrapper } from '../ServerRequestWrapper';
import { ServerResponseWrapper } from '../ServerResponseWrapper';

/**
 * Internal server class that deals with the underlining http module to listen on a port for requests and process
 * those requests with the routes found on the controllers registered.
 */
export class InternalServer {
    /**
     * The dependency injection service that will build out controllers and add in their dependencies.
     */
    private _dependency: Dependency;
    /**
     * The locations of the static folders based on their routes and folder locations.
     */
    private _staticFolders: string[][];
    /**
     * The routes that should be used be the server to determine which controller and method should be used.
     */
    private _routes: RouteContainer<IInternalRoute>;
    /**
     * The injected routes that should be called after the routes have finished their processing.
     */
    private _injectedRoutes: RouteContainer<IInternalInjectedRoute>;
    /**
     * The favicon regex to determine if the server should serve up the favicon instead of the routes.
     */
    private _faviconRegex: RegExp;
    /**
     * The logger the server should use if something is wrong or logs or info needs to be shown.
     */
    private _logger: ILogger;
    /**
     * The current directory that the server is running in.
     */
    private _dir: string;
    /**
     * The list of middleware callbacks that need to be included before the found injected routes and route.
     */
    private _middlewareCallbacks: ((req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse, next: (err?: any) => void) => void)[];
    /**
     * The upload directory that should be used for formidable.
     */
    public uploadDir: string;

    /**
     * Constructor method that will build out a basic internal server.
     * 
     * @param dependency The dependency server that should be used for injectable objects.
     * @param dir The directory that the server should be running in.
     * @param logger The custom logger that should be used to get information as the server runs.
     */
    constructor(dependency: Dependency, dir?: string, logger?: ILogger) {
        this._dir = dir || '';
        this._middlewareCallbacks = [];
        this._dependency = dependency;
        this._faviconRegex = /favicon\.icon$/;
        this._injectedRoutes = new RouteContainer<IInternalInjectedRoute>();
        this._routes = new RouteContainer<IInternalRoute>();
        this._staticFolders = [];
        this._logger = logger ? logger : new ConsoleLogger();
        this.uploadDir = '';
    }

    /**
     * Method is meant to handle the additions of the controllers to the server.
     * 
     * @param controllers The controllers that need to be added to the server for use.
     */
    public addControllers(...controllers: IController[]) {
        for (let i = 0; i < controllers.length; ++i) {
            let routes = controllers[i].generateRoutes();
            for (let j = 0; j < routes.length; ++j) {
                let route = this._routes.push(routes[j]);
                route.controller = controllers[i];
            }
        }
    }

    /**
     * Method is meant to handle the additions of the injectors to the server.
     * 
     * @param injectors The injectors that need the be added to the server for use.
     */
    public addInjectors(...injectors: IInjector[]) {
        for (let i = 0; i < injectors.length; ++i) {
            let routes = injectors[i].generateRoutes();
            for (let j = 0; j < routes.length; ++j) {
                let route = this._injectedRoutes.push(routes[j]);
                route.injector = injectors[i];
            }
        }
    }

    /**
     * Method is meant to register static folder locations.
     * 
     * @param folders The static folders that need to be added to the server.
     */
    public registerStaticLocations(...folders: string[]) {
        this._staticFolders = this._staticFolders.concat(folders.map(x => x.split('/')));
    }

    /**
     * Registers middleware for processing.
     * 
     * @param callback The callback that should be called before the injected routes and route are found.
     */
    public middleware(callback: (request: http.IncomingMessage, response: http.ServerResponse, next: (err?: any) => void) => void);
    public middleware(callback: (req: http2.Http2ServerRequest, res: http2.Http2ServerResponse, next: (err?: any) => void) => void);
    public middleware(callback: (req: any, res: any, next: (err?: any) => void) => void) {
        if (this._middlewareCallbacks.indexOf(callback) === -1) {
            this._middlewareCallbacks.push(callback);
        }
    }

    //#region Private Methods.
    /**
     * Method is meant to handle the middleware list.
     * 
     * @param req The http request object.
     * @param res The http response object.
     */
    private handleMiddleware(req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) {
        return new Promise((resolve, reject) => {
            let self = this;
            let nextMiddleware = function(index: number, err?: any) {
                if (err !== undefined) return reject(err);

                if (index > self._middlewareCallbacks.length) {
                    resolve();
                } else {
                    self._middlewareCallbacks[index - 1](req, res, nextMiddleware.bind(null, ++index));
                }
            };

            nextMiddleware(1);
        });
    }

    /**
     * Method is meant to be the callback for the http server when a request is sent in from the client.
     * 
     * @param req The http request object.
     * @param res The http response object.
     */
    public requestListener(req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) {
        // Call the middleware callbacks that have been bound by the application.
        this.handleMiddleware(req, res)
            .then(() => {
                this.processRequest(req)
                    .then(result => {
                        let dependency = this._dependency.createScope(new ServerRequestWrapper(req), new ServerResponseWrapper(res), result.files);
                        this.handleRequest(req, res, dependency, result.body)
                            .catch(err => {
                                this._logger.error(err);
                                this.sendError(req, res);
                            });
                    }).catch((err) => {
                        this._logger.error(err);
                        this.sendError(req, res);
                    });
            }).catch((err) => {
                this._logger.error(err);
                this.sendError(req, res);
            });
    }

    /**
     * Helper method to get the static result asset.
     * 
     * @param parsedUrl The parsed url to get the asset from the server.
     */
    private getStaticResult(parsedUrl: url.UrlWithParsedQuery): Result {
        let currentPath = parsedUrl.pathname === undefined || parsedUrl.pathname === null ? '' : parsedUrl.pathname;
        let fullPath = path.join(this._dir, currentPath);
        return new AssetResult(fullPath);
    }

    /**
     * Helper method to determine if this is static resource that should be served by the server.
     * 
     * @param parsedUrl The parsed url from the client.
     */
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

    /**
     * Helper method to determine if this is the favicon that should be served.
     * 
     * @param parsedUrl The parsed url from the client.
     */
    private isFavicon(parsedUrl: url.UrlWithParsedQuery) {
        return parsedUrl.pathname !== null && parsedUrl.pathname !== undefined && this._faviconRegex.test(parsedUrl.pathname);
    }

    //#region Processors
    /**
     * Helper method that will determine the controllers and injectors to call to gather the result to send to the client.
     * 
     * @param req The request from the http server.
     * @param res The respone from the http server.
     * @param form The form that was processed by formidable from the post object.
     * @param body The body that was sent up by the client.
     */
    private async handleRequest(req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse, dependency: Dependency, body?: any) {
        let response: Result = new JsonResult();
        try {
            let parsedUrl = url.parse((req.url || '').substr(1), true);
            if (this.isStaticResource(parsedUrl)) {
                response = this.getStaticResult(parsedUrl);
            } else if (this.isFavicon(parsedUrl)) {
                let fullPath = path.join(this._dir, 'favicon.ico');
                response = new AssetResult(fullPath);
            } else {
                let routes = this._routes.find(parsedUrl, req.method || '');
                let injectors = this._injectedRoutes.find(parsedUrl, req.method || '');
                if (routes.length > 0) {
                    let result = await this.processRoute(routes[0], parsedUrl, dependency, body);
                    for (let i = 0; i < injectors.length; ++i) {
                        result = await this.processInjector(injectors[i], parsedUrl, dependency, body, result);
                    }

                    if (result instanceof Result) {
                        response = result;
                    } else {
                        response.body = result;
                    }
                    response.route = routes[0];
                } else {
                    response.status = Status.BadRequest;
                }
            }
        } catch (err) {
            this._logger.error(err);
            response.status = Status.InternalServerError;
            response.body = { message: 'Internal Server Error' };
        } finally {
            try {
                await response.processResponse(res);
            } catch (err) {
                this._logger.error(err);
                this.sendError(req, res);
            }
        }
    }

    /**
     * Method is meant to process argument so they can be passed into the route properly.
     * 
     * @param route The current route that needs its arguments parsed.
     * @param body The current body of the request that was sent.
     * @param parsedUrl The parsed url with the query parameters parsed.
     */
    private processArguments(route: IInternalRoute, body: any, parsedUrl: url.UrlWithParsedQuery, controller: Controller): any[] {
        if (route.params.length === 0) return []; // If no parameters were found on the route we do not need to process anything.

        // We need to iterate over the url and get the data elements from the url to be parsed properly.
        let splitPath = parsedUrl.pathname === undefined || parsedUrl.pathname === null ? [] : parsedUrl.pathname.split('/');
        let fromRoute: { [key: string]: string } = {};
        for (let i = 0; i < splitPath.length; ++i) {
            let matches = route.splitPath[i].match(this._routes.paramRegex);
            if (matches !== null) {
                fromRoute[matches[1]] = splitPath[i];
            }
        }

        // Create the argument array that will be used when parsing the route.
        let argTypes = Reflect.getMetadata('design:paramtypes', controller, route.key);
        let bodyTypes = <number[]>Reflect.getMetadata(bodyMetadataKey, controller, route.key);
        let args: any[] = [];
        for (let i = 0; i < route.params.length; ++i) {
            if (bodyTypes !== undefined && bodyTypes.indexOf(i) > -1) {
                // We need to process the body attribute for the arguments.
                args.push(this.processArgument(argTypes[i], body));
                continue;
            }

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

    /**
     * Helper method to process a specific route from the server.
     * 
     * @param route The route that should be processed.
     * @param parsedUrl The parsed url from the client.
     * @param form The form processed by formadable.
     * @param body The body that came from the client.
     */
    private processRoute(route: IInternalRoute, parsedUrl: url.UrlWithParsedQuery, dependency: Dependency, body: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let controller = dependency.resolve(route.controller);
            controller._dirname = this._dir;

            let response = controller[route.key].apply(controller, this.processArguments(route, body, parsedUrl, controller));
            if (isPromise(response)) {
                response
                    .then(x => resolve(x))
                    .catch(err => reject(err));
            } else {
                resolve(response);
            }
        });
    }

    /**
     * Method is meant to handle injected routes and process them after the controllers.
     * 
     * @param injectedRoute The injected route that needs to be processed before the result is returned to the client.
     * @param parsedUrl The parsed url from the client.
     * @param body The body that was sent from the client.
     * @param result The current result being processed.
     */
    private processInjector(injectedRoute: IInternalInjectedRoute, parsedUrl: url.UrlWithParsedQuery, dependency: Dependency, body: any, result: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            let injector = dependency.resolve(injectedRoute.injector);
            let response = injector[injectedRoute.key].call(injector, result);
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
     * Helper method that will process the form object of a post request.
     * 
     * @param req The request object coming from the http module.
     */
    private processRequest(req: any) {
        return new Promise<IFormModel>((resolve, reject) => {
            let form = new IncomingForm();
            let result: any = {};
            if (this.uploadDir.length > 0) {
                form.uploadDir = this.uploadDir;
            }
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                result = { body: fields, files };
            });
            form.on('end', () => {
                if (result.files !== undefined) {
                    let keys = Object.keys(result.files);
                    let uploadedFiles: { [key: string]: UploadFile } = {};
                    for (let i = 0; i < keys.length; ++i) {
                        uploadedFiles[keys[i]] = new UploadFile(result.files[keys[i]]);
                    }
                    result.files = new FileContainer(uploadedFiles);
                }

                resolve(result);
            });
        });
    }

    /**
     * Helper method to process arguments for controller/injector methods.
     * 
     * @param type The type of method for the argument.
     * @param value The current value that needs to be passed to that argument.
     */
    private processArgument(type: any, value: string) {
        switch (type) {
            case Number:
                return parseFloat(value);
            case String:
                return value;
            case Boolean:
                return value === '1' || value === 'true';
        }
        return new type(value);
    }
    //#endregion

    //#region Responses
    /**
     * Helper method to deal with errors on the server and how to respond to them.
     * 
     * @param req The request object sent from the http module.
     * @param res The response object sent from the http module.
     */
    private async sendError(req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) {
        let response = new JsonResult();
        response.status = Status.InternalServerError;
        response.body = { message: 'Internal Server Error' };
        await response.processResponse(res);
    }
    //#endregion
    //#endregion
}