import { IRoute } from './IRoute';
import { IInternalRoute } from './IInternalRoute';
import { Controller } from '../controller';

/**
 * Helper interface that is used internaly so that typescript builds properly.
 */
export interface IController {
  new (...args: any[]): Controller;
  __routes__?: IRoute[];
  generateRoutes(): IInternalRoute[];
}