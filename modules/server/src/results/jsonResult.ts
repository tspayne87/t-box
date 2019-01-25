import { Result } from './result';
import { Http2ServerResponse } from 'http2';
import { ServerResponse } from 'http';

/**
 * A result that handles a basic object and stringifies it to send to the client.
 */
export class JsonResult extends Result {
    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(res: Http2ServerResponse | ServerResponse) {
        this.headers['Content-Type'] = 'application/json';
        this.body = this.body === undefined ? 'null' :  JSON.stringify(this.body);
        super.processResponse(res);
    }
}