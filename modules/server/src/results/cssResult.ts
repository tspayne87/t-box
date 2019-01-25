import { Result } from './result';
import { Http2ServerResponse } from 'http2';
import { ServerResponse } from 'http';

/**
 * A result that handles an css string.
 */
export class CssResult extends Result {
    /**
     * Constructor to build out the css result.
     * 
     * @param css The css that needs to be sent to the client.
     */
    constructor(css?: string) {
        super();
        this.body = css;
    }

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(res: Http2ServerResponse | ServerResponse) {
        this.headers['Content-Type'] = 'text/css';
        super.processResponse(res);
    }
}