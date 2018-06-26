import { IRoute } from './IRoute';
import { Injector } from '../injector';

export interface IInternalInjectedRoute extends IRoute {
    injector: Injector;
}