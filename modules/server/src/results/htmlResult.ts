import { Result } from './result';
import { Http2ServerResponse } from 'http2';
import { ServerResponse } from 'http';
import { IServerConfig } from '../interfaces';

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
    public async processResponse(res: Http2ServerResponse | ServerResponse, config: IServerConfig) {
        this.headers['Content-Type'] = 'text/html';
        super.processResponse(res, config);
    }
}