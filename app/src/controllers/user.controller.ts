import { Controller, Route, Get, Post } from '../../../internal-server/dist';

@Route('user')
export class UserController extends Controller {

    @Get()
    public search() {
        return 'Search';
    }

    @Get('{id}')
    public getUser(id: string) {
        return id;
    }

    @Post()
    public saveUser(user: any) {
        return user;
    }
}