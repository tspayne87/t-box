import { IRoute } from './IRoute';
import { IController } from '../Controller';

/**
 * Helper class to extend the basic route object and add in the instance of the controller.
 */
export interface IInternalRoute extends IRoute {
    /**
     * The instance of the controller for this route.
     */
    controller: IController;
    /**
     * The target constructor so that we can use reflection inside the server.
     */
    target: any;
}