import { Injector, Get, Post, Delete, InjectedRoute } from '../../src';

@InjectedRoute('user')
export class UserInjection extends Injector {
    @Get('{id}')
    public getUser(id: string): string {
        return `${id}-Injection`;
    }

    @Post()
    public saveUser(user: any): any {
        user.injection = true;
        return user;
    }

    @Delete('{id}')
    public deleteUser(result: boolean): boolean {
        return !result;
    }
}