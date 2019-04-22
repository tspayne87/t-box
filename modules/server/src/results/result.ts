import { Status } from '../enums';
import { Http2ServerResponse, Http2ServerRequest } from 'http2';
import { ServerResponse, IncomingMessage } from 'http';
import { IRoute, IServerConfig } from '../interfaces';
import { Readable } from 'stream';
import { createGzip, createDeflate } from 'zlib';

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
    public body?: Readable;
    /**
     * Data that should be included with this result
     */
    public data: any;
    /**
     * Determines if the response should encode their data.
     */
    public encode: boolean = false;

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public processResponse(req: IncomingMessage | Http2ServerRequest, res: ServerResponse | Http2ServerResponse, config: IServerConfig) {
        return new Promise<void>((resolve, reject) => {
            try {
                this.headers['Content-Type'] = this.headers['Content-Type'] || 'application/actet-stream';

                if (this.body !== undefined) {
                    if (this.encode && config.compress) {
                        let acceptEncoding = (req as any).headers['accept-encoding'];
                        if (!acceptEncoding) {
                            acceptEncoding = '';
                        }
                        if (/\bdeflate\b/.test(acceptEncoding)) {
                            this.headers['Content-Encoding'] = 'deflate';
                            this.body = this.body.pipe(createDeflate());
                        } else if (/\bgzip\b/.test(acceptEncoding)) {
                            this.headers['Content-Encoding'] = 'gzip';
                            this.body = this.body.pipe(createGzip());
                        } else {
                            delete this.headers['Content-Encoding'];
                        }
                    }

                    res.writeHead(this.status, this.headers);
                    this.body.pipe(res as any)
                        .on('end', () => {
                            res.end(() => {
                                resolve();
                            });
                        });
                } else {
                    res.writeHead(this.status, this.headers);
                    res.end(() => {
                        resolve();
                    });
                }
            } catch (err) {
                reject(err);
            }
        });
    }
}