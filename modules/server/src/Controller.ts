import { IRoute, IInternalRoute } from './interfaces';
import { HtmlResult, AssetResult } from './results';

/**
 * Helper interface that is used internaly so that typescript builds properly.
 */
export interface IController {
    new (...args: any[]): Controller;
    __routes__?: IRoute[];
    generateRoutes(): IInternalRoute[];
}

/**
 * Base controller to be extended from.
 */
export class Controller {
    /**
     * The directory that the server is currently running in.
     */
    public _dirname!: string;

    /**
     * Method will send an html string down to the client.
     * 
     * @param html The html string that needs to be sent down to the client.
     */
    public html(html: string): HtmlResult {
        return new HtmlResult(html);
    }

    /**
     * Method will send data down to the client for processing.
     * 
     * @param asset The path to the asset that will be generated and sent to the client, this is based on the location of the controller.
     */
    public asset(asset: string): AssetResult {
        return new AssetResult(asset);
    }
}