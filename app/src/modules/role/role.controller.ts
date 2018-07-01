import { Controller, Route, Get, Post } from '@square-one/server';
import { UserModel } from '../user/user.model';

@Route('role')
export class RoleController extends Controller {
    @Get('[action]')
    public getUser () {
        return new UserModel();
    }

    @Post()
    public saveUser () {
        return '';
    }
}