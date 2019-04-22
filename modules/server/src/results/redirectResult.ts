import { Result } from './result';
import { Http2ServerResponse, Http2ServerRequest } from 'http2';
import { ServerResponse, IncomingMessage } from 'http';
import { Status } from '../enums';
import { IServerConfig } from '../interfaces';

/**
 * A Result that handles the redirection of data to another location
 */
export class RedirectResult extends Result {
    private _url: string;

    constructor(url: string) {
        super();
        this._url = url;
    }

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(req: IncomingMessage | Http2ServerRequest, res: Http2ServerResponse | ServerResponse, config: IServerConfig) {
        this.status = Status.Redirect;
        this.headers['Location'] = this._url;
        return super.processResponse(req, res, config);
    }
}