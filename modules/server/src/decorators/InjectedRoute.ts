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

                // Add in the routes to the class
                if (target.__routes__ !== undefined) {
                    for (let i = 0; i < target.__routes__.length; ++i) {
                        let route = Object.assign({}, target.__routes__[i]);
                        route.path = route.path.length > 0 ? `${path}/${route.path}` : path;
                        route.splitPath = route.path.split('/');
                        this._routes.push(route);
                    }
                }
            }
        };
    };
}