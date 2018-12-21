import { Method } from '../enums';

/**
 * Object that will handle the storing of route information.
 */
export interface IRoute {
    /**
     * The current path of this route to be used.
     */
    path: string;
    /**
     * The http method this route should be considered on.
     */
    method: Method;
    /**
     * The method on the object this route should call.
     */
    key: string;
    /**
     * The parameters of the method that needs to be parsed.
     */
    params: string[];
    /**
     * Helper property that will break the path up based on the /'s.
     */
    splitPath: string[];
    /**
     * The current path this route is located in within the file system.
     */
    location: string;
}