import { Server } from '@square-one/server';
let server = new Server();

let boot = async () => {
    await server.registerControllers('modules', __dirname);
    // await server.registerControllers(require.context('./modules', true, /\.controller\.ts$/));
    server.start(8081);
};

boot();
process.on('exit', () => {
    server.stop();
});