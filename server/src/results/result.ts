import { Status } from '../enums';
import { ServerResponse } from 'http';

export class Result {
    public status: Status = Status.Ok;
    public headers: { [key: string]: string } = {};
    public body: any;

    public processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = this.headers['Content-Type'] || 'application/actet-stream';

        res.writeHead(this.status, this.headers);
        res.write(this.body);
        res.end();
    }
}