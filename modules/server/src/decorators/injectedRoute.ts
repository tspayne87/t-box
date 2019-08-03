import { routesMetaKey } from '../utils';

/**
 * Attribute for injectors to give the controller route information that will be used by the server.
 * 
 * @param path The injecotr path that needs to be used for all the http method attributes in this class.
 */
export function InjectedRoute(path: string): any {
    return (target: any): any => {
        return class Injector extends target {
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
                        route.target = target;
                        route.path = route.path.length > 0 ? `${path}/${route.path}` : path;
                        route.splitPath = route.path.split('/');
                        routes.push(route);
                    }
                }
                return routes;
            }
        };
    };
}