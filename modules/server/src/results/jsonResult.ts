import { Result } from './result';
import { Http2ServerResponse, Http2ServerRequest } from 'http2';
import { ServerResponse, IncomingMessage } from 'http';
import { IServerConfig } from '../interfaces';
import { Readable } from 'stream';

/**
 * A result that handles a basic object and stringifies it to send to the client.
 */
export class JsonResult extends Result {
    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(req: IncomingMessage | Http2ServerRequest, res: Http2ServerResponse | ServerResponse, config: IServerConfig) {
        this.headers['Content-Type'] = 'application/json';
        
        let json = this.data === undefined ? 'null' :  JSON.stringify(this.data);

        let stream = new Readable();
        stream.push(json);
        stream.push(null);
        this.body = stream;
        return super.processResponse(req, res, config);
    }
}