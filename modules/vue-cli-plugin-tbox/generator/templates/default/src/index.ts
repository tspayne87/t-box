import { Application } from '@t-box/server';
import http from 'http';
import boot from './server';

const server = http.createServer();
let currentApp: Application;

let port = parseInt(process.env.PORT as string, 10);
let hostname = process.env.HOSTNAME;

server.listen(port, hostname);

boot()
  .then(app => {
    console.log(`Binding app to ${hostname}:${port}`);
    app.bootstrap(server)
      .then(() => {
        currentApp = app;
      }).catch(err => {
        console.log(err);
        process.exit(1);
      });
  }).catch(err => {
    console.log(err);
    process.exit(1);
  });

if (module.hot) {
  module.hot.accept('./server', () => {
    boot()
      .then(app => {
        currentApp.unbind(server);
        app.bootstrap(server)
          .then(() => {
            currentApp = app;
          }).catch(err => {
            console.log(err);
            process.exit(1);
          });
      }).catch(err => {
        console.log(err);
        process.exit(1);
      });
  });
}
