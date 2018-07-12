function InjectedRoute(path: string): any {
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

export { InjectedRoute };