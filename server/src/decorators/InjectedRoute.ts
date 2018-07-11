import { Injector } from '../Injector';
import { InjectorClass, DecoratedInjectorClass } from '../declarations';

function InjectedRoute<C extends Injector>(path: string): <CC extends InjectorClass<C>>(target: CC) => CC;
function InjectedRoute<CC extends InjectorClass<CC>>(path: string): CC;
function InjectedRoute(path: string): any {
    return (target: DecoratedInjectorClass): InjectorClass<Injector> => {
        return class Injector extends target {
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
        };
    };
}

export { InjectedRoute };