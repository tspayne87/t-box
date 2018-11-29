import { Method } from '../enums';

export interface IRoute {
    path: string;
    method: Method;
    key: string;
    params: string[];
    splitPath: string[];
}