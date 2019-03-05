import { Status } from '../enums';
import { Http2ServerResponse } from 'http2';
import { ServerResponse } from 'http';
import { IRoute, IServerConfig } from '../interfaces';

/**
 * Class is meant to handle the result from the server.
 */
export class Result {
    /**
     * The current route this result is coming from.
     */
    public route: IRoute | null = null;
    /**
     * The status of this result.
     */
    public status: Status = Status.Ok;
    /**
     * The current headers for this result.
     */
    public headers: { [key: string]: string } = {};
    /**
     * The body of the result that needs to be sent down to the client.
     */
    public body: any;

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(res: Http2ServerResponse | ServerResponse, config: IServerConfig) {
        this.headers['Content-Type'] = this.headers['Content-Type'] || 'application/actet-stream';

        res.writeHead(this.status, this.headers);
        if (this.body !== null && this.body !== undefined) (<any>res).write(this.body);
        res.end();
    }
}