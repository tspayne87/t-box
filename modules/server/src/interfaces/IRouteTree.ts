import { IRoute } from './IRoute';

export interface IRouteTree<T extends IRoute> {
    children: { [key: string]: IRouteTree<T> };
    routes: T[];
}