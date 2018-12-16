import { Result } from './result';
import { ServerResponse } from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as mmm from 'mmmagic';

export class AssetResult extends Result {
    private _asset: string;
    private _jsRegex: RegExp;
    private _cssRegex: RegExp;
    private _woff: RegExp;
    private _woff2: RegExp;

    constructor(asset: string) {
        super();
        this._asset = asset;
        this._jsRegex = /\.js$/;
        this._cssRegex = /\.css$/;
        this._woff = /\.woff$/;
        this._woff2 = /\.woff2$/;
    }

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

    private fileExists(dirname?: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            let filePath = dirname === undefined ? this._asset : path.join(dirname, this._asset);
            fs.exists(filePath, (exists) => {
                resolve(exists);
            });
        });
    }

    private readFile(dirname?: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            let filePath = dirname === undefined ? this._asset : path.join(dirname, this._asset);
            fs.readFile(filePath, (err, buf) => {
                if (err) return reject(err);
                resolve(buf);
            });
        });
    }

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