import { Result } from './result';
import { ServerResponse } from 'http';
import * as path from 'path';
import * as fs from 'fs';
import * as mmm from 'mmmagic';

export class AssetResult extends Result {
    private _asset: string;

    constructor(asset: string) {
        super();
        this._asset = asset;
    }

    public async processResponse(res: ServerResponse) {
        if (this.route !== null) {
            let dirname = path.dirname(this.route.location);
            if (await this.fileExists(dirname)) {
                this.headers['Content-Type'] = await this.getContentType(dirname);
                this.body = await this.readFile(dirname);
            }
        }
        super.processResponse(res);
    }

    private fileExists(dirname: string): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            fs.exists(path.join(dirname, this._asset), (exists) => {
                resolve(exists);
            });
        });
    }

    private readFile(dirname: string): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject) => {
            fs.readFile(path.join(dirname, this._asset), (err, buf) => {
                if (err) return reject(err);
                resolve(buf);
            });
        });
    }

    private getContentType(dirname: string): Promise<string> {
        let magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE);
        return new Promise<string>((resolve, reject) => {
            magic.detectFile(path.join(dirname, this._asset), (err, result) => {
                if (err) return reject(err);
                resolve(result);
            });
        });
    }
}