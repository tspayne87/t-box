import { Result } from './result';
import { ServerResponse } from 'http';

/**
 * A result that handles an html string.
 */
export class HtmlResult extends Result {
    /**
     * Constructor to build out the html result.
     * 
     * @param html The html that needs to be sent to the client.
     */
    constructor(html?: string) {
        super();
        this.body = html;
    }

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = 'text/html';
        super.processResponse(res);
    }
}