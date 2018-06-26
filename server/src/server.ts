import { Server as InternalServer, Controller } from '../../internal-server/dist';
import * as path from 'path';
import * as glob from 'glob';

export class Server {
    private _server: InternalServer;

    constructor() {
        this._server = new InternalServer();
    }

    public registerControllers(folder: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            glob(`${folder}${path.sep}**${path.sep}*.controller.js`, (err, files) => {
                if (err) return reject(err);

                let controllers: Controller[] = [];
                for (let i = 0; i < files.length; ++i) {
                    let item = require(files[i].replace(/\.js$/, ''));
                    let keys = Object.keys(item);
                    for (let j = 0; j < keys.length; ++j) {
                        let controller = new item[keys[j]]();
                        if (controller instanceof Controller) {
                            controllers.push(controller);
                        }
                    }
                }
                this._server.addControllers.apply(this._server, controllers);
                resolve();
            });
        });
    }

    public registerInjectors(folder: string): void {

    }

    public start(...args: any[]) {
        this._server.listen.apply(this._server, args);
    }

    public stop() {
        this._server.close();
    }
}