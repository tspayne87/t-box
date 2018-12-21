import { createRouteDecorator } from '../utils';
import { Method } from '../enums';

/**
 * Attribute to deal with get http methods when sent to the server.
 */
export const Get = createRouteDecorator(Method.Get);