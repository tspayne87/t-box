import { Application } from '../src';
import * as http from 'http';
import * as socket from 'socket.io';

let server = http.createServer();

let app = new Application({ cwd: __dirname, assetDir: 'assets' });
async function boot() {
  await app.register('controllers');
  await app.bootstrap(server);
}

boot()
  .then(() => { 
    console.log('Server started on https://localhost:8080');
    const io = socket(server);
    io.on('connection', (socket) => {
      console.log('a user connected');
    });

    server.listen(8080, () => {
      console.log('listening on *:8080');
    });
  })
  .catch(err => {
    console.error(err);
    server.close(() => {
      process.exit();
    });
  });