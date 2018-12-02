import { IRoute } from './interfaces';
import { HtmlResult } from './results';
import { Fields, Files } from 'formidable';
import { UploadedFiles } from './internal';

export interface IController {
    new (...args: any[]): Controller;
    __routes__?: IRoute[];
}

export class Controller {
    public _dirname!: string;
    public _routes: IRoute[] = [];
    public _formFields?: Fields;
    public _formFiles?: UploadedFiles;

    constructor() {
    }

    public html(html: string): HtmlResult {
        return new HtmlResult(html);
    }
}