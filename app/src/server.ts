import { Server } from '../../server/dist';

const server = new Server();
server.registerControllers(`${__dirname}\\controllers`);
server.start(8080);