import { Application } from '../../src';
import { ServiceHandler } from './services/ServiceHandler';
import * as http2 from 'http';
import * as fs from 'fs';

let server = http2.createServer();

let app = new Application({ cwd: __dirname, assetDir: 'assets', staticFolders: ['public'], compress: true }, new ServiceHandler());
async function boot() {
    await app.register('controllers');
    app.bootstrap(server);
    server.listen(8080);
}

boot()
    .then(() => { 
        console.log('Server started on https://localhost:8080');
    })
    .catch(err => {
        console.error(err);
        server.close(() => {
            process.exit();
        });
    });