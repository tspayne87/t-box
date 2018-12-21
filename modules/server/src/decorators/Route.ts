let rootRegex = /^\//;
let fileRegex = /\((.*):\d+:\d+\)/;

/**
 * Attribute for controllers to give the controller route information that will be used by the server.
 * 
 * @param path The controller path that needs to be used for all the http method attributes in this class.
 */
export function Route(path?: string): any {
    let previousFile: string;
    let err = new Error();
    if (err.stack !== undefined) {
        let stack = err.stack.split('\n');
        if (stack.length > 3) {
            let matches = stack[2].match(fileRegex);
            if (matches !== null) {
                previousFile = matches[1];
            }
        }
    }

    return (target: any): any => {
        return class Router extends target {
            constructor(...args: any[]) {
                super(...args);

                // Add in the routes to the class
                if (target.__routes__ !== undefined) {
                    for (let i = 0; i < target.__routes__.length; ++i) {
                        let route = Object.assign({}, target.__routes__[i]);
                        if (rootRegex.test(route.path)) {
                            route.path = route.path.substr(1);
                        } else {
                            if (path !== undefined) {
                                route.path = route.path.length > 0 ? `${path}/${route.path}` : path;
                            } else {
                                let message = `Could not create blank route, please add a path to either the Route attribute, the error occured in ${previousFile}`;
                                if (route.path.length === 0) throw new Error(message);
                            }
                        }
                        route.splitPath = route.path.split('/');
                        route.location = previousFile;
                        this._routes.push(route);
                    }
                }
            }
        };
    };
}