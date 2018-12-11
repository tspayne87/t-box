import { Result } from './result';
import { ServerResponse } from 'http';

export class HtmlResult extends Result {
    constructor(html?: string) {
        super();
        this.body = html;
    }

    public async processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = 'text/html';
        super.processResponse(res);
    }
}