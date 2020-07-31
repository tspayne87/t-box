import { InternalServer } from './internal';
import { Dependency } from './dependency';
import { ILogger, ConsoleLogger } from './loggers';
import { IServiceHandler, IServerConfig, IController, IInjector, IApplication, IDependency, IInternalController, IInternalInjector } from './interfaces';
import * as isPromise from 'is-promise';
import * as http2 from 'http2';
import * as http from 'http';

/**
 * The server is meant to act as a wrapper for the internal server that will serve up the pages
 * based on the routes and attributes of the controllers.  The main purpose in this is so that
 * webpack and normal registry of modules that house the controllers can be found by this class.
 */
export abstract class ApplicationBase implements IApplication {
    /**
     * The directory that this server is currently running in and where it should look for the controllers.
     */
    protected _config: IServerConfig;
    /**
     * The internal server that hosts and serves up the pages.
     */
    protected _server: InternalServer;
    /**
     * The server handler that is currently attached to the request listener.
     */
    protected _serverHandler!: (req: http.IncomingMessage | http2.Http2ServerRequest, res: http.ServerResponse | http2.Http2ServerResponse) => void;
    /**
     * The internal webserver.
     */
    protected _webServer!: http.Server;
    /**
     * The logger to use when sending messages, will default to a console logger.
     */
    protected _logger: ILogger;
    /**
     * The dependency set that should be used when creating routes and injectors.
     */
    protected _dependency: Dependency;
    /**
     * The service handler object to add in services into the dependency object.
     */
    protected _serviceHandler: IServiceHandler | undefined;
    /**
     * Determines if this application has already been bootstrapped.
     */
    protected _bootStrapped: boolean;

    /**
     * The main server contructor to enable the configuration of modules into the server.
     * 
     * @param config The configuration object or string to configure the server.
     * @param serviceHandler The service handler object to add in dependencies on bootstrap.
     * @param logger The logger that should be used will default to a console logger.
     * @param controllerSuffix The controller suffix that should be used.
     * @param injectorSuffix The injector suffix that should be used.
     * @param startUpSuffix The startup suffix to get the startup function from applications.
     */
    constructor(config: string | IServerConfig, serviceHandler?: IServiceHandler, logger?: ILogger, public controllerSuffix: string = 'controller', public injectorSuffix: string = 'injector', public startUpSuffix: string = 'startup') {
        config = typeof config === 'string' ? { cwd: config } : config;

        this._bootStrapped = false;
        this._config = config as IServerConfig;
        this._logger = logger ? logger : new ConsoleLogger();
        this._dependency = new Dependency();
        this._serviceHandler = serviceHandler;
        this._server = new InternalServer(this._dependency, this._config, this._logger);
    }

    /**
     * Method is meant to bind to the server.
     * 
     * @param server The server that needs to be bound to.
     */
    public async bootstrap(server: http.Server | http2.Http2Server) {
        this._serverHandler = this._server.requestListener.bind(this._server);
        server.on('request', this._serverHandler);
        if (!this._bootStrapped && this._serviceHandler !== undefined) {
            let result = this._serviceHandler.addServices(this._dependency);
            if (isPromise(result)) {
                await result;
            }
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
     * Method is meant to add instances of the object instead of the class type.
     * 
     * @param injectable The instance of the object that needs to be included as an injectable.
     */
    public addSingle(injectable: any): void {
        this._dependency.addSingle(injectable);
    }

    /**
     * Method is meant to include a class type into the injectables but first resolve the class before
     * creating an instance of the class.
     * 
     * @param dependency The type of the class that needs to be included into the injectables.
     */
    public addDependency(dependency: IDependency): void {
        this._dependency.addDependency(dependency);
    }

    /**
     * Method is meant to include dependencies that should be used during a scope.
     * 
     * @param dependency The dependency that we need to create when a scope is started.
     */
    public addScoped(dependency: IDependency): void {
        this._dependency.addScoped(dependency);
    }

    /**
     * Method is meant to handle the additions of the controllers to the server.
     * 
     * @param controllers The controllers that need to be added to the server for use.
     */
    public addControllers(...controllers: IController[]): void {
        this._server.addControllers(...controllers as IInternalController[]);
    }

    /**
     * Method is meant to handle the additions of the injectors to the server.
     * 
     * @param injectors The injectors that need the be added to the server for use.
     */
    public addInjectors(...injectors: IInjector[]): void {
        this._server.addInjectors(...injectors as IInternalInjector[]);
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
    public close(callback?: (err?: Error) => void) {
        this._webServer.close(callback);
    }
}