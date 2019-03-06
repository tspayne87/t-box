import { InternalServer } from './internal';
import { Dependency } from './Dependency';
import { ILogger, ConsoleLogger } from './loggers';
import { IController } from './Controller';
import { IInjector } from './Injector';
import { IServiceHandler, IServerConfig } from './interfaces';
import * as http2 from 'http2';
import * as http from 'http';
import * as path from 'path';
import * as glob from 'glob';

/**
 * The server is meant to act as a wrapper for the internal server that will serve up the pages
 * based on the routes and attributes of the controllers.  The main purpose in this is so that
 * webpack and normal registry of modules that house the controllers can be found by this class.
 */
export class Application {
    /**
     * The directory that this server is currently running in and where it should look for the controllers.
     */
    private _config: IServerConfig;
    /**
     * The internal server that hosts and serves up the pages.
     */
    private _server: InternalServer;
    /**
     * The server handler that is currently attached to the request listener.
     */
    private _serverHandler!: (req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) => void;
    /**
     * The internal webserver.
     */
    private _webServer!: http.Server;
    /**
     * The logger to use when sending messages, will default to a console logger.
     */
    private _logger: ILogger;
    /**
     * The dependency set that should be used when creating routes and injectors.
     */
    private _dependency: Dependency;
    /**
     * The service handler object to add in services into the dependency object.
     */
    private _serviceHandler: IServiceHandler | undefined;
    /**
     * Determines if this application has already been bootstrapped.
     */
    private _bootStrapped: boolean;

    /**
     * The main server contructor to enable the configuration of modules into the server.
     * 
     * @param config The configuration object or string to configure the server.
     * @param serviceHandler The service handler object to add in dependencies on bootstrap.
     * @param logger The logger that should be used will default to a console logger.
     * @param controllerSuffix The controller suffix that should be used if not using the webpack require api.
     * @param injectorSuffix The injector suffix that should be used if not using the webpack require api.
     */
    constructor(config: string | IServerConfig, serviceHandler?: IServiceHandler, logger?: ILogger, public controllerSuffix: string = 'controller', public injectorSuffix: string = 'injector') {
        config = typeof config === 'string' ? { cwd: config } : config;

        this._bootStrapped = false;
        this._config = <IServerConfig>config;
        this._logger = logger ? logger : new ConsoleLogger();
        this._dependency = new Dependency();
        this._serviceHandler = serviceHandler;
        this._server = new InternalServer(this._dependency, this._config, this._logger);
    }

    /**
     * Method is meant to register controllers and injectors into the internal server for use.
     * 
     * @param context The context in which to find controllers and injectors.
     * @param dirname The directory name that should be used instead of the current directory the server is running in.
     */
    public async register(context: string | __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
        await this.registerControllers(context, dirname);
        await this.registerInjectors(context, dirname);
    }

    /**
     * Method is meant to register controllers into the internal server for use.
     * 
     * @param context The context in which to find controllers.
     * @param dirname The directory name that should be used instead of the current directory the server is running in.
     */
    public async registerControllers(context: string | __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
        let items = await this.findItems<IController>(context, dirname || this._config.cwd, this.controllerSuffix);
        for (let i = 0; i < items.length; ++i) {
            this._server.addControllers(items[i]);
        }
    }

    /**
     * Method is meant to register injectors into the internal server for use.
     * 
     * @param context The context in which to find injectors.
     * @param dirname The directory name that should be used instead of the current directory the server is running in.
     */
    public async registerInjectors(context: string | __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
        let items = await this.findItems<IInjector>(context, dirname || this._config.cwd, this.injectorSuffix);
        for (let i = 0; i < items.length; ++i) {
            this._server.addInjectors(items[i]);
        }
    }

    /**
     * Helper method is meant to find items either in the file system or using webpacks require context to get all the
     * Controllers and Injectors.
     * 
     * @param context The context in which to find various controllers and injectors.
     * @param dirname The directory name that should be used instead of the current directory the server is running in.
     * @param type The type of controller/injector we are trying to find.
     */
    private findItems<T>(context: string | __WebpackModuleApi.RequireContext, dirname: string, type: string): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            if (typeof context === 'string') {
                glob(`${dirname}${path.sep}${context}${path.sep}**${path.sep}*.${type}.?(js|ts)`, (err, files) => {
                    if (err) return reject(err);
                    let items: any[] = [];
                    try {
                        for (let i = 0; i < files.length; ++i) {
                            let obj = require(files[i]);
                            let keys = Object.keys(obj);
                            for (let j = 0; j < keys.length; ++j) {
                                obj[keys[j]].filePath = files[i];
                                items.push(obj[keys[j]]);
                            }
                        }
                        resolve(items);
                    } catch (err) {
                        reject(err);
                    }
                });
            } else {
                let items: any[] = [];
                let keys = context.keys();
                for (let i = 0; i < keys.length; ++i) {
                    let obj = context(keys[i]);
                    let objKeys = Object.keys(obj);
                    for (let j = 0; j < objKeys.length; ++j) {
                        items.push(obj[objKeys[j]]);
                    }
                }
                resolve(items);
            }
        });
    }

    /**
     * Method is meant to bind to the server.
     * 
     * @param server The server that needs to be bound to.
     */
    public bootstrap(server: http.Server | http2.Http2Server) {
        this._serverHandler = this._server.requestListener.bind(this._server);
        server.on('request', this._serverHandler);
        if (!this._bootStrapped && this._serviceHandler !== undefined) {
            this._serviceHandler.addServices(this._dependency);
        }
        this._bootStrapped = true;
    }

    /**
     * Method is meant to unbind from the server.
     * 
     * @param server The server that needs to be unbounded.
     */
    public unbind(server: http.Server | http2.Http2Server) {
        server.removeListener('request', this._serverHandler);
    }

    /**
     * Method is meant to define middleware callbacks to the internal server.
     * 
     * @param callback The callback that should be ran for this middleware.
     */
    public middleware(callback: (request: http.IncomingMessage, response: http.ServerResponse, next: (err?: any) => void) => void);
    public middleware(callback: (req: http2.Http2ServerRequest, res: http2.Http2ServerResponse, next: (err?: any) => void) => void);
    public middleware(callback: (req: any, res: any, next: (err?: any) => void) => void) {
        this._server.middleware(callback);
    }

    /**
     * Method is meant to be a short cut to a basic listening http server.
     */
    public listen(port?: number, hostname?: string, backlog?: number, listeningListener?: Function);
    public listen(port?: number, hostname?: string, listeningListener?: Function);
    public listen(port?: number, backlog?: number, listeningListener?: Function);
    public listen(port?: number, listeningListener?: Function);
    public listen(path: string, backlog?: number, listeningListener?: Function);
    public listen(path: string, listeningListener?: Function);
    public listen(handle: any, backlog?: number, listeningListener?: Function);
    public listen(handle: any, listeningListener?: Function);
    public listen(...args: any[]) {
        this._webServer = http.createServer();
        this.bootstrap(this._webServer);
        this._webServer.listen(...args);
    }

    /**
     * Method is meant to close the current internal web http server.
     */
    public close(callback?: Function) {
        this._webServer.close(callback);
    }
}