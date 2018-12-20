import { Result } from './result';
import { ServerResponse } from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as mmm from 'mmmagic';

/**
 * A result that handles an asset string.
 */
export class AssetResult extends Result {
    /**
     * The current asset we are searching for.
     */
    private _asset: string;
    /**
     * JS Regular expression for file types.
     */
    private _jsRegex: RegExp;
    /**
     * CSS Regular expression for file types.
     */
    private _cssRegex: RegExp;
    /**
     * WOFF Regular expression for file types.
     */
    private _woff: RegExp;
    /**
     * WOFF2 Regular expression for file types.
     */
    private _woff2: RegExp;

    /**
     * Constructor for the asset result.
     * 
     * @param asset The asset we are looking for.
     */
    constructor(asset: string) {
        super();
        this._asset = asset;
        this._jsRegex = /\.js$/;
        this._cssRegex = /\.css$/;
        this._woff = /\.woff$/;
        this._woff2 = /\.woff2$/;
    }

    /**
     * Method is meant to process the result and send the response back to the server.
     * 
     * @param res The server response object that we need to work with when processing this result.
     */
    public async processResponse(res: ServerResponse) {
        if (this.route !== null) {
            let dirname = path.dirname(this.route.location);
            if (await this.fileExists(dirname)) {
                this.headers['Content-Type'] = await this.getContentType(dirname);
                this.body = await this.readFile(dirname);
            }
        } else {
            if (await this.fileExists()) {
                this.headers['Content-Type'] = await this.getContentType();
                this.body = await this.readFile();
            }
        }
        super.processResponse(res);
    }

    /**
     * Private method that checks to see if the file exists in the system.
     * 
     * @param dirname The directory that needs to be searched in.
     */
    private fileExists(dirname?: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            let filePath = dirname === undefined ? this._asset : path.join(dirname, this._asset);
            fs.exists(filePath, (exists) => {
                resolve(exists);
            });
        });
    }

    /**
     * Private method that will read the file and return the contents of it.
     * 
     * @param dirname The directory that needs to be searched in.
     */
    private readFile(dirname?: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            let filePath = dirname === undefined ? this._asset : path.join(dirname, this._asset);
            fs.readFile(filePath, (err, buf) => {
                if (err) return reject(err);
                resolve(buf);
            });
        });
    }

    /**
     * Private method that will determine what the content type should be for this asset.
     * 
     * @param dirname The directory that needs to be searched in.
     */
    private getContentType(dirname?: string): Promise<string> {
        let magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
        return new Promise<string>((resolve, reject) => {
            let filePath = dirname === undefined ? this._asset : path.join(dirname, this._asset);
            if (this._jsRegex.test(filePath)) {
                resolve('application/javascript');
            } else if (this._cssRegex.test(filePath)) {
                resolve('text/css');
            } else if (this._woff2.test(filePath)) {
                resolve('font/woff2');
            } else if (this._woff.test(filePath)) {
                resolve('font/woff');
            } else {
                magic.detectFile(filePath, (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            }
        });
    }
}