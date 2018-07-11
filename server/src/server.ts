import { InternalServer } from './internal';
import { Controller } from './Controller';
import { Injector } from './Injector';
import { ILogger, ConsoleLogger } from './loggers';
import * as path from 'path';
import * as glob from 'glob';

export class Server {
    private _server: InternalServer;
    private _logger: ILogger;

    constructor(logger?: ILogger) {
        this._server = new InternalServer(logger);
        this._logger = logger ? logger : new ConsoleLogger();
    }

    public async registerControllers(context: string | __WebpackModuleApi.RequireContext, dirname: string): Promise<void> {
        let items = await this.findItems(context, dirname, 'controller');
        let controllers: Controller[] = [];
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                let controller = new items[i][keys[j]]();
                if (controller instanceof Controller) {
                    controllers.push(controller);
                }
            }
        }
        return this._server.addControllers.apply(this._server, controllers);
    }

    public async registerInjectors(context: string | __WebpackModuleApi.RequireContext, dirname: string): Promise<void> {
        let items = await this.findItems(context, dirname, 'injector');
        let injectors: Injector[] = [];
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                let injector = new items[i][keys[j]]();
                if (injector instanceof Injector) {
                    injectors.push(injector);
                }
            }
        }
        return this._server.addInjectors.apply(this._server, injectors);
    }

    public async registerModels(context: string | __WebpackModuleApi.RequireContext, dirname: string) {
        let items = await this.findItems(context, dirname, 'model');
    }

    private findItems(context: string | __WebpackModuleApi.RequireContext, dirname: string, type: string) {
        return new Promise<any[]>((resolve, reject) => {
            if (typeof context === 'string') {
                glob(`${dirname}${path.sep}${context}${path.sep}**${path.sep}*.${type}.js`, (err, files) => {
                    if (err) return reject(err);

                    let items: any[] = [];
                    for (let i = 0; i < files.length; ++i) items.push(require(files[i]));
                    resolve(items);
                });
            } else {
                let items: any[] = [];
                let keys = context.keys();
                for (let i = 0; i < keys.length; ++i) items.push(context(keys[i]));
                resolve(items);
            }
        });
    }

    public start(...args: any[]) {
        this._server.listen.apply(this._server, args);
    }

    public stop() {
        this._server.close();
    }
}