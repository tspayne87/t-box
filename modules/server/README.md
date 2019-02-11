# @t-box/server
The T-box server is a node server to handle website requests, its main purpose is to use attributes to define routes to be used by the server.  The server works with controllers that are housed in a folder or set of folders and can be registered and the server will find them and process them into the system.  The main benefit of this is to making new controllers and separating out different functionality in the site a little easier, some other things that the server allows is for injection so that different controllers can interact with each other without one not knowing about the other so that areas of the site can be sectioned off.

## Features
- Controller structure to simplify routes.
- Easy attribute usage to register routes on the server.
- Use of promises by the server to be versitile.
- Simple parameters to try to parse out the body for easy translation from client to server.

## Installation
### NPM
```bash
    npm install @t-box/server
```
### Yarn
```bash
    yarn install @t-box/server
```

## Usage
The following is a simple usage of creating a server that will be listening on localhost:8080.

todo.controller.ts
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

        @Get('{id}')
        public get(id: number) {
            let found = this._service.todos.filter(x => x.id === id);
            return found.length > 0 ? found[0] : null;
        }

        @Post('{id}/[action]')
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

        @Delete('{id}')
        public remove(id: number) {
            return this._service.remove(id);
        }
    }
```

server.ts
```typescript
    import { Application } from '@t-box/server';
    import { ServiceHandler } from './services/ServiceHandler';

    let app = new Application(__dirname, new ServiceHandler());
    async function boot() {
        await app.register('controllers');
        app.listen(8080);
    }

    boot()
        .then(() => { 
            console.log('Server started on http://localhost:8080');
        })
        .catch(err => {
            console.error(err);
            app.close(() => {
                process.exit();
            });
        });
```
## API
You can read further by using the documentation, it will go into further detail on what options you have when creating the server and using it. [Continue Reading](https://github.com/tspayne87/t-box/blob/master/modules/server/docs/README.md)

- Development can be discussed in [github issues](https://github.com/tspayne87/t-box/issues), be sure to attach the server label.

### License
@t-box/server is licensed under the [MIT license](https://opensource.org/licenses/MIT).