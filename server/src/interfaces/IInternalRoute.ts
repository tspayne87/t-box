import { IRoute } from './IRoute';
import { Controller } from '../Controller';

export interface IInternalRoute extends IRoute {
    controller: Controller;
}