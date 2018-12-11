import { Result } from './result';
import { ServerResponse } from 'http';
import * as fs from 'fs';

export class FileResult extends Result {
    private _fileName: string;

    constructor(fileName: string, data: string | Buffer) {
        super();
        if (typeof data === 'string') {
            this.body = fs.readFileSync(data);
        } else  {
            this.body = data;
        }
        this._fileName = fileName;
    }

    public async processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = 'application/octet-stream';
        this.headers['Content-Disposition'] = `attachment; filename=${this._fileName}`;
        this.headers['Content-Length'] = (<Buffer>this.body).length.toString();
        super.processResponse(res);
    }
}