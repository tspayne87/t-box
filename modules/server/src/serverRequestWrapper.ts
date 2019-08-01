import { IncomingMessage } from 'http';
import { Http2ServerRequest } from 'http2';

export class ServerRequestWrapper {
    public req: any;

    public constructor(req: IncomingMessage | Http2ServerRequest) {
        this.req = req;
    }
}