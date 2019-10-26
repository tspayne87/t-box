import { createRouteDecorator } from '../utils';
import { Method } from '../enums';

/**
 * Attribute to deal with post http methods when sent to the server.
 */
export const Patch = createRouteDecorator(Method.Patch);