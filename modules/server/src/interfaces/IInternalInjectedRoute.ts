import { IRoute } from './IRoute';
import { IInjector } from '../Injector';

/**
 * Helper class to extend the basic route object and add in the instance of the injector.
 */
export interface IInternalInjectedRoute extends IRoute {
    /**
     * The instance of the injector for this route.
     */
    injector: IInjector;
}