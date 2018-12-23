# Decorators
The decorators are meant to add in routes and give control with the body of the request.  This is the heart in how the controllers work in this system.

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