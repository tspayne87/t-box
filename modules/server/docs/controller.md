# Controller
The controller is where most of the processing for the server will happen, the is where you will define your business logic and where the bulk of your application will be.

## Properties
### _dirname: string
The directory in which the server is running in.

## Methods
### html(html)
Method is meant to return a [html result](results.md)
- html :: A html string that needs to be sent to the client.
### asset(asset, fullPath = false)
Method is meant to return an asset from the assets folder configured by the server.
- asset :: An asset that needs to be passed down to the client.
- fullPath :: An optional parameter to tell the asset if the asset is a full path and that it should not go looking for the correct location.
### redirect(url)
Method is meant to return a [redirect result](results.md)
- url :: The URL that we currently need to redirect to.

## Example
```typescript
    import { Controller, Route, Get, Post, Delete, Body } from '@t-box/server';
    import { TodoService, ITodo } from '../services/TodoService';

    @Route('todo')
    export class TodoController extends Controller {
        public constructor(private _service: TodoService) {
            super();
        }

        @Get()
        public search(term: string) {
            return this._service.todos.filter(x => term === undefined || term.length === 0 || x.name.startsWith(term));
        }

        @Get('{0}')
        public get(id: number) {
            let found = this._service.todos.filter(x => x.id === id);
            return found.length > 0 ? found[0] : null;
        }

        @Post('{0}/[action]')
        public done(id: number) {
            let found = this._service.todos.filter(x => x.id === id);
            if (found.length > 0) {
                found[0].done = true;
                return found[0];
            }
            return null;
        }

        @Post()
        public save(id: number, @Body todo: ITodo) {
            let found = this._service.todos.filter(x => x.id === id);
            if (found.length > 0) {
                found[0].done = todo.done;
                found[0].name = todo.name;
                return found[0];
            } else {
                return this._service.add(todo);
            }
        }

        @Delete('{0}')
        public remove(id: number) {
            return this._service.remove(id);
        }
    }
```