# Injector
The injector is meant to change the results of the controllers and can have multiples on the same route.  The purpose of this is so that areas stay seprate from each other and simailar logic stays in the same location.

## Properties
### _routes: IRoute[]
The routes this controller is meant to handle.

## Example
```typescript
import { Injector, Get, Post, Delete, InjectedRoute } from '@t-box/server';

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
```