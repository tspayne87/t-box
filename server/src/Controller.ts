import { IRoute } from './interfaces';
import { HtmlResult } from './results';
import { Connection, Query, Model, IModel } from './db';

export interface IController {
    new (conn: Connection, ...args: any[]): Controller;
    __routes__?: IRoute[];
}

export class Controller {
    public _routes: IRoute[] = [];

    constructor(private _conn: Connection) {
    }

    public getSearchQuery<T extends Model>(constructor: IModel<T>, page: number, size: number) {
        if (page < 1) throw 'Cannot have a page less than 1';
        return new Query<T>(this._conn, constructor)
            .offset((page - 1) * size)
            .limit(size);
    }

    public html(html: string): HtmlResult {
        return new HtmlResult(html);
    }
}