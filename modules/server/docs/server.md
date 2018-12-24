# Server
The server does most of the work in this package, it handles all the requests sent to it by the client and will process the request and call the correct controllers and injectors with the proper arguments.

## Properties
### uploadDir: string
The upload director that should be used instead of tmp

## Methods
### constructor(dependency, dir, logger, controllerSuffix, injectorSuffix)
Constructor that will build out the server.
- [dependency](dependency.md) :: A repository of objects that should be used when creating controllers and injectors.
- dir(optional) :: The directory the server should be running in.
- logger(optional) :: The logger the server should use to print event information to.
- controllerSuffix(optional) :: The suffix of the file that should be appended to find controllers on register. Default: 'controller'
- injectorSuffix(optional) :: The suffix of the file that should be appended to find injectors on register. Default: 'injector'
### registerStaticFolders(folders)
Method will register static folders for the server to process instead of creating controllers.
- ...folders :: A list of folders that should be used as static folders.
### register(context, dirname)
Method will register all the injectors and controllers that should be used by the server.
- context :: The directory or a webpack require context where the controllers and injectors are located for processing.
- dirname(optional) :: The director where the controllers are found in, this is only used if a string is passed in as the context.
### registerControllers(context, dirname)
Method will register all the controllers that should be used by the server.
- context :: The directory or a webpack require context where the controllers are located for processing.
- dirname(optional) :: The director where the controllers are found in, this is only used if a string is passed in as the context.
### registerInjectors(context, dirname)
Method will register all the injectors that should be used by the server.
- context :: The directory or a webpack require context where the injectors are located for processing.
- dirname(optional) :: The director where the controllers are found in, this is only used if a string is passed in as the context.
### start(args)
Method will start the server and pass in the arguments explained at [NodeJs Documentation](https://nodejs.org/api/http.html#http_server_listen)
### stop()
Method will stop the internal server.

## Example
```typescript
    import { Server, Dependency } from '@t-box/server';

    let server = new Server(new Dependency(), __dirname);
    async function boot() {
        await server.register('controllers');
        await server.start(8080);
    }

    boot()
        .then(() => { 
            console.log('Server started on localhost:8080');
        })
        .catch(err => {
            console.error(err);
            server.stop()
                .then(() => process.exit())
                .catch(() => process.exit(1));
        });
```