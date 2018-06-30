import { Server, ProcessMessageLogger } from '@square-one/server';
let server = new Server(new ProcessMessageLogger());

let boot = async () => {
    await server.registerControllers(require.context('./modules', true, /\.controller\.ts$/));
    server.start(8080);
};

boot();
process.on('exit', () => {
    server.stop();
});