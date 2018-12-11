import { Result } from './result';
import { ServerResponse } from 'http';

export class JavascriptResult extends Result {
    constructor(javascript?: string) {
        super();
        this.body = javascript;
    }

    public async processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = 'application/javascript';
        super.processResponse(res);
    }
}