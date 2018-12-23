import { Server, Dependency } from '../../src';
import * as Cluster from 'cluster';
import * as OS from 'os';

const port = 8080;

if (Cluster.isMaster) {
    let cpus = OS.cpus().length;
    for (let i = 0; i < cpus; ++i) {
        Cluster.fork();
    }
} else {
    let server = new Server(new Dependency(), __dirname);

    async function boot() {
        await server.register('controllers');
        server.start(port);
    }

    boot()
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}