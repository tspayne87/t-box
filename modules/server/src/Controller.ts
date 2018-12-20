import { IRoute } from './interfaces';
import { HtmlResult, AssetResult } from './results';
import { Fields } from 'formidable';
import { UploadedFiles } from './internal';

/**
 * Helper interface that is used internaly so that typescript builds properly.
 */
export interface IController {
    new (...args: any[]): Controller;
    __routes__?: IRoute[];
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
     * Routes that this controller needs to handle.
     */
    public _routes: IRoute[] = [];
    /**
     * The underlining form fields that the server generates if a post is sent to it.
     */
    public _formFields?: Fields;
    /**
     * The underlining form files that the server generates if a post is sent to it.
     */
    public _formFiles?: UploadedFiles;

    /**
     * Basic constructor to set an array to the routes list.
     */
    constructor() {
        this._routes = [];
    }

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