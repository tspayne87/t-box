import { Controller } from '../Controller';
import { ControllerClass, DecoratedControllerClass } from '../declarations';

function Route<C extends Controller>(path: string): <CC extends ControllerClass<C>>(target: CC) => CC
function Route<CC extends ControllerClass<CC>>(path: string): CC
function Route(path: string): any {
    return (target: DecoratedControllerClass): ControllerClass<Controller> => {
        return class Router extends target {
            constructor() {
                super();

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
        }
    }
}

export { Route };