import { Result } from './result';
import { ServerResponse } from 'http';
import * as fs from 'fs';

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
            this.body = fs.readFileSync(data);
        } else  {
            this.body = data;
        }
        this._fileName = fileName;
        this._contentType = contentType;
    }

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = this._contentType;
        this.headers['Content-Disposition'] = `attachment; filename=${this._fileName}`;
        this.headers['Content-Length'] = (<Buffer>this.body).length.toString();
        super.processResponse(res);
    }
}