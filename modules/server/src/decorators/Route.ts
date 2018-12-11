let rootRegex = /^\//;
let fileRegex = /\((.*):\d+:\d+\)/;

function Route(path: string): any {
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
                            route.path = route.path.length > 0 ? `${path}/${route.path}` : path;
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

export { Route };