import { IRoute } from './interfaces';
import { HtmlResult } from './results';

export class Controller {
    public _routes: IRoute[];

    public constructor() {
        this._routes = [];
    }

    public html(html: string): HtmlResult {
        return new HtmlResult(html);
    }
}