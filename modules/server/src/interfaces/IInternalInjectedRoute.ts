import { IRoute } from './IRoute';
import { Injector } from '../Injector';

export interface IInternalInjectedRoute extends IRoute {
    injector: Injector;
}