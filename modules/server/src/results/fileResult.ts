import { Result } from './result';
import { Http2ServerResponse, Http2ServerRequest } from 'http2';
import { ServerResponse, IncomingMessage } from 'http';
import { IServerConfig } from '../interfaces';
import * as fs from 'fs';
import { Duplex } from 'stream';

/**
 * A result that handles an file download.
 */
export class FileResult extends Result {
    /**
     * The name of the file that needs to be downloaded.
     */
    private _fileName: string;
    /**
     * The content type that should be used with this download.
     */
    private _contentType: string;

    /**
     * Constructor for the file result.
     * 
     * @param fileName The filename that should be used for downloading.
     * @param data The data for the file or the path to the file location.
     * @param contentType The content type that should be used for the file.
     */
    constructor(fileName: string, data: string | Buffer, contentType: string = 'application/octet-stream') {
        super();
        if (typeof data === 'string') {
            this.body = fs.createReadStream(data);
        } else  {
            let stream = new Duplex();
            stream.push(data);
            stream.push(null);
            this.body = stream;
        }
        this._fileName = fileName;
        this._contentType = contentType;
    }

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(req: IncomingMessage | Http2ServerRequest, res: Http2ServerResponse | ServerResponse, config: IServerConfig) {
        this.headers['Content-Type'] = this._contentType;
        this.headers['Content-Disposition'] = `attachment; filename=${this._fileName}`;

        // TODO: Figure out the length of the stream
        // this.headers['Content-Length'] = this.body !== undefined ? this.body.
        super.processResponse(req, res, config);
    }
}