import { Route, Get, Post, Delete, Controller, AssetResult, Body } from '../../src';
import * as path from 'path';

@Route('user')
export class UserController extends Controller {
    public data: string;

    constructor() {
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
        if (this._formFiles !== undefined) {
            let file = this._formFiles['fileToUpload'];
            let newLocation = path.join(this._dirname, 'uploads', 'user_upload' + path.extname(file.name).toLowerCase());
            return await file.copy(newLocation);
        }
        return false;
    }
}