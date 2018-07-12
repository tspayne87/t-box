import { IRoute } from './interfaces';
import { HtmlResult } from './results';

export interface IController {
    new (...args: any[]): Controller;
    __routes__?: IRoute[];
}

export class Controller {
    public _routes: IRoute[] = [];

    public html(html: string): HtmlResult {
        return new HtmlResult(html);
    }
}