import { File } from 'formidable';
import * as fs from 'fs';

/**
 * Interface to handle the names of the uploaded files.
 */
export interface UploadedFiles {
    [key: string]: UploadFile;
}

/**
 * The representation of the upload files.
 */
export class UploadFile {
    /**
     * The size of the file being uploaded.
     */
    public get size() { return this.file.size; }
    /**
     * The path of the file being uploaded.
     */
    public get path() { return this.file.path; }
    /**
     * The name of the file being uploaded.
     */
    public get name() { return this.file.name; }
    /**
     * The type of the file being uploaded.
     */
    public get type() { return this.file.type; }
    /**
     * The last modified date of the file being uploaded.
     */
    public get lastModifiedDate() { return this.file.lastModifiedDate; }
    /**
     * The hash for this file.
     */
    public get hash() { return this.file.hash; }

    /**
     * Constructor to build a wrapper for the formidable file to add on save and copy methods.
     * 
     * @param file The formidable file being uploaded from the client.
     */
    constructor(private file: File) { }

    /**
     * Method is meant to copy an uploaded file from the client to the server.
     * 
     * @param location The location where this file should be copied to.
     * @param options The options that should be passed into the underlining file system module.
     */
    public copy(location: fs.PathLike, options?: fs.WriteFileOptions): Promise<boolean> {
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

    /**
     * Method is meant to read the data from the file being uploaded.
     * 
     * @param options The options that should be passed into the underlining file system module.
     */
    public read(options?: fs.WriteFileOptions): Promise<Buffer> {
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