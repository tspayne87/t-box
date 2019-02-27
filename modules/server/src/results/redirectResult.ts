import { Result } from './result';
import { Http2ServerResponse } from 'http2';
import { ServerResponse } from 'http';
import { Status } from '../enums';

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
    public async processResponse(res: Http2ServerResponse | ServerResponse) {
        this.status = Status.Redirect;
        this.headers['Location'] = this._url;
        super.processResponse(res);
    }
}