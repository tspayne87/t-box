import { ServerResponse } from 'http';
import { Http2ServerResponse } from 'http2';

export class ServerResponseWrapper {
    public req: any;

    public constructor(req: ServerResponse | Http2ServerResponse) {
        this.req = req;
    }
}