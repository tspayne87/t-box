import { InternalServer } from './internal';
import { Controller } from './Controller';
import * as path from 'path';
import * as glob from 'glob';

export class Server {
    private _server: InternalServer;

    constructor() {
        this._server = new InternalServer();
    }

    public test(context: __WebpackModuleApi.RequireContext) {

    }

    public registerControllers(context: string | __WebpackModuleApi.RequireContext): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (typeof context === 'string') {
                glob(`${context}${path.sep}**${path.sep}*.controller.js`, (err, files) => {
                    if (err) return reject(err);

                    let controllers: Controller[] = [];
                    for (let i = 0; i < files.length; ++i)
                        controllers = controllers.concat(this.processController(require(files[i].replace(/\.js$/, ''))));
                    this._server.addControllers.apply(this._server, controllers);
                    resolve();
                });
            } else {
                let controllers: Controller[] = [];
                let keys = context.keys();
                for (let i = 0; i < keys.length; ++i)
                    controllers = controllers.concat(this.processController(context(keys[i])));
                this._server.addControllers.apply(this._server, controllers);
                resolve();
            }
        });
    }

    private processController(item: any): Controller[] {
        let controllers: Controller[] = [];
        let keys = Object.keys(item);
        for (let j = 0; j < keys.length; ++j) {
            let controller = new item[keys[j]]();
            if (controller instanceof Controller) {
                controllers.push(controller);
            }
        }
        return controllers;
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