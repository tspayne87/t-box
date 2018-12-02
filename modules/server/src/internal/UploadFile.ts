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

    public copy(location: fs.PathLike) {
        return new Promise<boolean>((resolve , reject) => {
            fs.readFile(this.path, (err, data) => {
                if (err) return reject(err);
                fs.writeFile(location, data, (err) => {
                    if (err) return reject(err);
                    resolve(true);
                });
            });
        });
    }
}