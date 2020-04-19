import * as http2 from 'http2';
import * as http from 'http';
import { IDependency } from './IDependency';
import { IController } from './IController';
import { IInjector } from './IInjector';

/**
 * The server is meant to act as a wrapper for the internal server that will serve up the pages
 * based on the routes and attributes of the controllers.  The main purpose in this is so that
 * webpack and normal registry of modules that house the controllers can be found by this class.
 */
export interface IApplication {
    /**
     * Method is meant to define middleware callbacks to the internal server.
     * 
     * @param callback The callback that should be ran for this middleware.
     */
    middleware(callback: (request: http.IncomingMessage, response: http.ServerResponse, next: (err?: any) => void) => void): void;
    middleware(callback: (req: http2.Http2ServerRequest, res: http2.Http2ServerResponse, next: (err?: any) => void) => void): void;

    /**
     * Method is meant to add instances of the object instead of the class type.
     * 
     * @param injectable The instance of the object that needs to be included as an injectable.
     */
    addSingle(injectable: any);

    /**
     * Method is meant to include a class type into the injectables but first resolve the class before
     * creating an instance of the class.
     * 
     * @param dependency The type of the class that needs to be included into the injectables.
     */
    addDependency(dependency: IDependency);

    /**
     * Method is meant to include dependencies that should be used during a scope.
     * 
     * @param dependency The dependency that we need to create when a scope is started.
     */
    addScoped(dependency: IDependency);

    /**
     * Method is meant to handle the additions of the controllers to the server.
     * 
     * @param controllers The controllers that need to be added to the server for use.
     */
    addControllers(...controllers: IController[]);

    /**
     * Method is meant to handle the additions of the injectors to the server.
     * 
     * @param injectors The injectors that need the be added to the server for use.
     */
    addInjectors(...injectors: IInjector[]);
}