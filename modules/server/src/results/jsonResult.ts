import { Result } from './result';
import { ServerResponse } from 'http';

export class JsonResult extends Result {
    public async processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = 'application/json';
        this.body = this.body === undefined ? 'null' :  JSON.stringify(this.body);
        super.processResponse(res);
    }
}