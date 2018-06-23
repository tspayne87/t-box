import { Route, Get, Post, Delete, Controller } from '../../src';

@Route('user')
export class UserController extends Controller {
    public data: string;

    constructor() {
        super();
        this.data = 'Searching...';
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
}