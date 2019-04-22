import { Result } from './result';
import { Http2ServerResponse, Http2ServerRequest } from 'http2';
import { ServerResponse, IncomingMessage } from 'http';
import { IServerConfig } from '../interfaces';
import { Readable } from 'stream';

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

        if (css !== undefined) {
            let stream = new Readable();
            stream.push(css);
            stream.push(null);
            this.body = stream;
        }
    }

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(req: IncomingMessage | Http2ServerRequest, res: Http2ServerResponse | ServerResponse, config: IServerConfig) {
        this.headers['Content-Type'] = 'text/css';
        super.processResponse(req, res, config);
    }
}