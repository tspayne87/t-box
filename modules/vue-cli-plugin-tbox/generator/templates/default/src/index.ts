import http from 'http';
import boot from './server';

let server = http.createServer();

const port = parseInt(process.env.PORT as string, 10);
const hostname = process.env.HOSTNAME;

boot(server)
  .then(() => {
    console.log(`Binding app to ${hostname}:${port}`);
    server.listen(port, hostname);
  }).catch(err => {
    console.log(err);
    process.exit(1);
  });

if (module.hot) {
  module.hot.accept('./server', () => {
    server.close();
    server = http.createServer();
    boot(server)
      .then(() => {
        console.log(`Binding app to ${hostname}:${port}`);
        server.listen(port, hostname);
      }).catch(err => {
        console.log(err);
        process.exit(1);
      });
  });
}
