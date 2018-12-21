import { createRouteDecorator } from '../utils';
import { Method } from '../enums';

/**
 * Attribute to deal with delete http methods when sent to the server.
 */
export const Delete = createRouteDecorator(Method.Delete);