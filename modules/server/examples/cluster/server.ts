import { Application, Dependency } from '../../src';
import * as Cluster from 'cluster';
import * as OS from 'os';

const port = 8080;

if (Cluster.isMaster) {
    let cpus = OS.cpus().length;
    for (let i = 0; i < cpus; ++i) {
        Cluster.fork();
    }
} else {
    let app = new Application(new Dependency(), __dirname);
    async function boot() {
        await app.register('controllers');
        app.listen(8080);
    }

    boot()
        .then(() => { 
            console.log('Server started on http://localhost:8080');
        })
        .catch(err => {
            console.error(err);
            app.close(() => {
                process.exit();
            });
        });
}