import { Controller, Route, Get, Post } from '@square-one/server';

@Route('api/user')
export class UserController extends Controller {
    @Get()
    public search () {
        return 'Searching';
    }

    @Get('{id}')
    public getUser (id: string) {
        return this.data();
    }

    @Post()
    public saveUser (user: any) {
        return user;
    }

    public data () {
        return {
            username: 'agrisom',
            firstname: 'Alex',
            lastname: 'Ignant',

            // Injected roles to user object
            roles: [ 'super-ignant', 'duper-ignant' ]
        };
    }
}