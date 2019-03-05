# Application
The server does most of the work in this package, it handles all the requests sent to it by the client and will process the request and call the correct controllers and injectors with the proper arguments.

## Configuration
### cwd: string
The current working directory or the directory that the server is running in.
### staticFolders: string[]
A list of static folders that will serve up documents inside them.
### uploadDir: string
The upload directory when dealing with formidable.
### assetDir: string
The asset directory or where the application assets will be stored.

## Methods
### constructor(config, serviceHandler, logger, controllerSuffix, injectorSuffix)
Constructor that will build out the server.
- config :: The configuration the server should be using.
- serviceHandler(optional) :: The service handler that should add in injectable services to the dependency object.
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
### middleware(callback)
Method is meant to register middleware components that should be called before the route information.
- callback :: A callback that should be called before the injected route and route is called.
### bootstrap(server)
Method is meant to attach the internal server handler to a node server.
### listen(args)
Method will start the server and pass in the arguments explained at [NodeJs Documentation](https://nodejs.org/api/http.html#http_server_listen)
### close(callback)
Method will stop the internal server.

## Example
```typescript
    import { Application } from '@t-box/server';

    let app = new Application(__dirname);
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