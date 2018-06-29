import { Server } from '@square-one/server';
let server = new Server();

let boot = async () => {
    await server.registerControllers(require.context('./modules', true, /\.controller\.ts$/));
    server.start(8080);
};

boot();
process.on('exit', () => {
    server.stop();
});