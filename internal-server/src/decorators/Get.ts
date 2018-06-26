import { createRouteDecorator } from '../utils';
import { Method } from '../enums';

export const Get = createRouteDecorator(Method.Get);