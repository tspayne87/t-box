import { Route, Get, Post, Delete, Controller, Repository } from '../../src';
import { UserService } from '../services/user.service';

@Route('user')
export class UserController extends Controller {
    public data: string;

    constructor(repository: Repository, private _userService: UserService) {
        super(repository);
        this.data = 'Searching...';
    }

    @Get('[action]')
    public async example() {
        return this.html(await this.promise());
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
    public saveUser(user: any): any {
        return user;
    }

    @Delete('{id}')
    public deleteUser(id: string): boolean {
        return id !== undefined;
    }

    @Post('upload')
    public upload(): boolean {
        return this._formFiles !== undefined;
    }
}