import 'reflect-metadata';
import { routesMetaKey } from '../utils';
let rootRegex = /^\//;

/**
 * Attribute for controllers to give the controller route information that will be used by the server.
 * 
 * @param path The controller path that needs to be used for all the http method attributes in this class.
 */
export function Route(path?: string): any {
    return (target: any): any => {
        let ctor = class Router extends target {
            constructor(...args: any[]) {
                super(...args);
            }

            public static generateRoutes() {
                // Add in the routes to the class
                let routes: any[] = [];
                let internalRoutes: any[] | undefined = Reflect.getOwnMetadata(routesMetaKey, target);
                if (internalRoutes !== undefined) {
                    for (let i = 0; i < internalRoutes.length; ++i) {
                        let route = Object.assign({}, internalRoutes[i]);
                        if (rootRegex.test(route.path)) {
                            route.path = route.path.substr(1);
                        } else {
                            if (path !== undefined) {
                                route.path = route.path.length > 0 ? `${path}/${route.path}` : path;
                            } else {
                                let message = `Could not create blank route, please add a path to either the Route attribute, the error occured in ${'previousFile'}`;
                                if (route.path.length === 0) throw new Error(message);
                            }
                        }
                        route.target = target;
                        route.splitPath = route.path.split('/');
                        route.location = ctor.filePath;
                        routes.push(route);
                    }
                }
                return routes;
            }
        };
        return ctor;
    };
}