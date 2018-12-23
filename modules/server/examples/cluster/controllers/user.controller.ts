import { Route, Get, Controller } from '../../../src';

@Route('user')
export class UserController extends Controller {
    public data: string;

    constructor() {
        super();
        this.data = 'Searching...';
    }

    @Get('{id}')
    public getUser(id: string): string {
        return id;
    }
}