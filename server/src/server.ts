import { InternalServer } from './internal';
import { Controller } from './Controller';
import { Injector } from './Injector';
import { Connection, Model, Service } from './db';

import { ILogger, ConsoleLogger } from './loggers';
import * as path from 'path';
import * as glob from 'glob';

export class Server {
    private _server: InternalServer;
    private _logger: ILogger;

    constructor(connection: Connection, logger?: ILogger) {
        this._server = new InternalServer(connection, logger);
        this._logger = logger ? logger : new ConsoleLogger();
    }

    public async registerControllers(context: string | __WebpackModuleApi.RequireContext, dirname: string): Promise<void> {
        let items = await this.findItems(context, dirname, 'controller');
        let controllers: Controller[] = [];
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                this._server.addControllers(items[i][keys[j]]);
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
                this._server.addInjectors(items[i][keys[j]]);
            }
        }
    }

    public async registerModels(context: string | __WebpackModuleApi.RequireContext, dirname: string) {
        let items = await this.findItems(context, dirname, 'model');
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                this._server.addModels(items[i][keys[j]]);
            }
        }
    }

    public async registerServices(context: string | __WebpackModuleApi.RequireContext, dirname: string) {
        let items = await this.findItems(context, dirname, 'service');
        for (let i = 0; i < items.length; ++i) {
            let keys = Object.keys(items[i]);
            for (let j = 0; j < keys.length; ++j) {
                this._server.addService(items[i][keys[j]]);
            }
        }
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