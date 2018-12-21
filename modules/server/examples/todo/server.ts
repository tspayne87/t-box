import { Server, Dependency } from '../../src';

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