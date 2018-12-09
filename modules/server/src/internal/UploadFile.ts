import { File } from 'formidable';
import * as fs from 'fs';

export interface UploadedFiles {
    [key: string]: UploadFile;
}

export class UploadFile {
    public get size() { return this.file.size; }
    public get path() { return this.file.path; }
    public get name() { return this.file.name; }
    public get type() { return this.file.type; }
    public get lastModifiedDate() { return this.file.lastModifiedDate; }
    public get hash() { return this.file.hash; }

    constructor(private file: File) { }

    public copy(location: fs.PathLike, options?: fs.WriteFileOptions) {
        return new Promise<boolean>((resolve, reject) => {
            fs.readFile(this.path, (err, data) => {
                if (err) return reject(err);
                if (options !== undefined) {
                    fs.writeFile(location, data, options, (err) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                } else {
                    fs.writeFile(location, data, (err) => {
                        if (err) return reject(err);
                        resolve(true);
                    });
                }
            });
        });
    }

    public read(options?: fs.WriteFileOptions) {
        return new Promise<Buffer>((resolve, reject) => {
            if (options !== undefined) {
                fs.readFile(this.path, options, (err, data) => {
                    if (err) return reject(err);
                    if (typeof data === 'string') {
                        resolve(Buffer.from(data));
                    } else {
                        resolve(data);
                    }
                });
            } else {
                fs.readFile(this.path, (err, data) => {
                    if (err) return reject(err);
                    resolve(data);
                });
            }
        });
    }
}