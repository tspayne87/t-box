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

```typescript
    import { Server, Dependency } from '@t-box/server';

    let server = new Server(new Dependency(), __dirname);
    async function boot() {
        await server.register('controllers');
        server.start(8080);
    }

    boot()
        .then(() => { 
            console.log('Server started on localhost:8080');
        })
        .catch(err => {
            console.error(err);
            server.stop();
        });
```
## API
You can read further by using the documentation, it will go into further detail on what options you have when creating the server and using it. [Continue Reading](docs/README.md)

- Development can be discussed in [github issues](https://github.com/tspayne87/t-box/issues), be sure to attach the server label.

### License
@t-box/server is licensed under the [MIT license](https://opensource.org/licenses/MIT).