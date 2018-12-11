import { Status } from '../enums';
import { ServerResponse } from 'http';
import { IRoute } from '../interfaces';

export class Result {
    public route: IRoute | null = null;
    public status: Status = Status.Ok;
    public headers: { [key: string]: string } = {};
    public body: any;

    public async processResponse(res: ServerResponse) {
        this.headers['Content-Type'] = this.headers['Content-Type'] || 'application/actet-stream';

        res.writeHead(this.status, this.headers);
        res.write(this.body);
        res.end();
    }
}