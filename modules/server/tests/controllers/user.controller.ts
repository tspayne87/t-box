import { Route, Get, Post, Delete, Controller, AssetResult, Body, FileContainer } from '../../src';
import * as path from 'path';

@Route('user')
export class UserController extends Controller {
    public data: string;

    constructor(private _fileContainer: FileContainer) {
        super();
        this.data = 'Searching...';
    }

    @Get('[action]')
    public async index() {
        return this.html(await this.promise());
    }

    @Get('/*')
    public all() {
        return 'index.html';
    }

    @Get('*')
    public allUser() {
        return 'all-user';
    }

    @Get('this/is/a/very/long/url/that/needs/to/be/tested/to/make/sure/it/is/working/properly')
    public veryLongUrl() {
        return 'very-long-url';
    }

    @Post('/test')
    public testUser(@Body user: any): any {
        return user;
    }

    @Get('/index')
    public testIndex() {
        return new AssetResult('index.html');
    }

    private promise() {
        return new Promise<string>(resolve => {
            setTimeout(() => {
                resolve(`<html><head></head><body><div id="app"></div></body><html>`);
            }, 100);
        });
    }

    @Get()
    public search(): string {
        return this.data;
    }

    @Get('{id}')
    public getUser(id: string): string {
        return id;
    }

    @Get('{id}/path')
    public testPath(id: string): string {
        return `${id}-path`;
    }

    @Post()
    public saveUser(@Body user: any): any {
        return user;
    }

    @Delete('{id}')
    public deleteUser(id: string): boolean {
        return id !== undefined;
    }

    @Post('upload')
    public async upload() {
        if (this._fileContainer.files !== undefined) {
            let file = this._fileContainer.files['fileToUpload'];
            let newLocation = path.join(this._dirname, 'uploads', 'user_upload' + path.extname(file.name).toLowerCase());
            return await file.copy(newLocation);
        }
        return false;
    }
}