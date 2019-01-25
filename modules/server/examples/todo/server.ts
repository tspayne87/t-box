import { Application, Dependency } from '../../src';
import * as http2 from 'http2';
import * as fs from 'fs';

let server = http2.createSecureServer({
    key: fs.readFileSync('../../certs/localhost-privkey.pem'),
    cert: fs.readFileSync('../../certs/localhost-cert.pem')
});

let app = new Application(new Dependency(), __dirname);
async function boot() {
    await app.register('controllers');
    app.bind(server);
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