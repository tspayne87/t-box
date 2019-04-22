# Decorators
The decorators are meant to add in routes and give control with the body of the request.  This is the heart in how the controllers work in this system.

## Injectables
Injectables are classes that can be injected into the controllers for another source, these can be scoped per request or a global singleton for the server.

Example:
```typescript
    import { Injectable } from '@t-box/server';

    export interface ITodo {
        id: number;
        name: string;
        done: boolean;
    }

    @Injectable
    export class TodoService {
        private _id: number = 0;

        public todos: ITodo[] = [];

        public constructor() {
            for (let i = 0; i < 5; ++i) {
                this.add({ id: -1, name: 'TODO: ' + i, done: false });
            }
        }

        public add(todo: ITodo) {
            todo.id = ++this._id;
            this.todos.push(todo);
            return todo;
        }

        public remove(id: number) {
            let index = this.todos.findIndex(x => x.id === id);
            if (index > -1) {
                this.todos.splice(index, 1);
                return true;
            }
            return false;
        }
    }
```

## Routers
The routes are method to act as a bucket for a particular route and all the methods in that class that are bound with an HTTP method should be prepended with that route.

### Route
This is the route information for the controller or the base route for this controller.
Example:
```typescript
    import { Controller, Route, Get } from '@t-box/server';

    // Everything in this controller will be prefixed with 'example'
    @Route('example')
    export class ExampleController extends Controller {
        // ... Controller methods

        @Get('hello-world') // This method can be accessed at localhost/example/hello-world
        public helloWorld() {
            return 'Hello World!';
        }
    }
```
### InjectedRoute
This is the route information for the injector or the base route for this controller.
```typescript
    import { Injector, Get, InjectedRoute } from '@t-box/server';

    @InjectedRoute('example')
    export class ExampleInjection extends Injector {

        @Get('hello-world') // This method can be accessed at localhost/example/hello-world
        public helloWorld(result: string): string {
            return `${result}-Injection`;
        }
    }
```

## HTTP Methods
The HTTP methods on the controller that should be processed, these are the set of methods that needs to be processed in a particular route.  Decorators do not require a path in this case the route information will only be used for the route.  Also, special strings can be used to send data down to the method or to use the method for the url.  The url should be separated by '/'.
- '[action]' :: This is a special placeholder to use the name of the method.
- '{id}' :: This is a special placeholder to handle the data in the url to be sent into the 'id' parameter the id can change to another name if there are multiple parameters.
- '*' :: This matches everything after this point in the url.
- '/' :: You can also prefix your url with a slash to ignore the route of the controller and use a special route.

### Get
Decorator to handle get requests.
Example:
```typescript
    import { Controller, Route, Get } from '@t-box/server';

    // Everything in this controller will be prefixed with 'example'
    @Route('example')
    export class ExampleController extends Controller {
        // ... Controller methods

        @Get('hello-world') // This method can be accessed at localhost/example/hello-world
        public helloWorld() {
            return 'Hello World!';
        }
    }
```
### Post
Decorator to handle post requests.
Example:
```typescript
    import { Controller, Route, Post } from '@t-box/server';

    // Everything in this controller will be prefixed with 'example'
    @Route('example')
    export class ExampleController extends Controller {
        // ... Controller methods

        @Post('hello-world') // This method can be accessed at localhost/example/hello-world
        public helloWorld() {
            return 'Hello World!';
        }
    }
```
### Delete
Decorator to handle delete requests.
Example:
```typescript
    import { Controller, Route, Delete } from '@t-box/server';

    // Everything in this controller will be prefixed with 'example'
    @Route('example')
    export class ExampleController extends Controller {
        // ... Controller methods

        @Delete('hello-world') // This method can be accessed at localhost/example/hello-world
        public helloWorld() {
            return 'Hello World!';
        }
    }
```

## Body
Decorator to handle if a parameter needs to have the body pased up as the request.
Example:
```typescript
    import { Controller,  Post, Body } from '@t-box/server';

    interface ITodo {
        id: number;
        name: string;
        done: boolean;
    }

    @Route('todo')
    export class TodoController extends Controller {
        @Post()
        public save(id: number, @Body todo: ITodo) {
            let found = this._tasks.filter(x => x.id === id);
            if (found.length > 0) {
                found[0].done = todo.done;
                found[0].name = todo.name;
                return found[0];
            } else {
                todo.id = ++this._id;
                this._tasks.push(todo);
                return todo;
            }
        }
    }
```

## Custom Before Callbacks
You can create custom callbacks that can be used before routes, this can be used for authorize attributes for an app or any other types of attributes that need to be called before a method.  A result object can be returned if you want to end the request without going to the route method, however if nothing is returned it will continue on as if the attribute was never added to the route.
Example:
```typescript
    import { createBeforeActionDecorator, Status, JsonResult, Result, ServerRequestWrapper, Injectable, BeforeAction } from '@t-box/server';

    export function Authorize(...perms: string[]) {
        @Injectable
        class InternalAuthorize extends BeforeAction {
            constructor(private _req: ServerRequestWrapper) {
                super();
            }

            public beforeRequest(): Result | Promise<Result | undefined> | undefined {
                let result = new JsonResult();
                result.status = Status.Unauthorized;
                result.body = { message: 'Unauthorized Attribute' };
                return result;
            }
        }
        return createBeforeActionDecorator(InternalAuthorize);
    }
```