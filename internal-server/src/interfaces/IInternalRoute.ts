import { IRoute } from './IRoute';
import { Controller } from '../controller';

export interface IInternalRoute extends IRoute {
    controller: Controller;
}