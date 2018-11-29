import { Result } from './result';
import { ServerResponse } from 'http';

export class CssResult extends Result {
    constructor(css?: string) {
        super();
        this.body = css;
    }

    public processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = 'text/css';
        super.processResponse(res);
    }
}