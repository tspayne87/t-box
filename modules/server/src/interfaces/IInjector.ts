import { IRoute } from './IRoute';
import { IInternalInjectedRoute } from './IInternalInjectedRoute';
import { Injector } from '../Injector';

/**
 * Helper interface that is used internaly so that typescript builds properly.
 */
export interface IInjector {
  new (...args: any[]): Injector;
  __routes__?: IRoute[];
  generateRoutes(): IInternalInjectedRoute[];
}