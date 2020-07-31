import { IApplication, IInternalController, IInternalInjector } from './interfaces';
import { ApplicationBase } from './application.base';
import * as isPromise from 'is-promise';

/**
 * The server is meant to act as a wrapper for the internal server that will serve up the pages
 * based on the routes and attributes of the controllers.  The main purpose in this is so that
 * webpack and normal registry of modules that house the controllers can be found by this class.
 */
export class WebpackApplication extends ApplicationBase {
  /**
   * Method is meant to register controllers and injectors into the internal server for use.
   * 
   * @param context The context in which to find controllers and injectors.
   * @param dirname The directory name that should be used instead of the current directory the server is running in.
   */
  public async register(context: __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
    await this.registerControllers(context, dirname);
    await this.registerInjectors(context, dirname);
  }

  /**
   * Method is meant to register controllers into the internal server for use.
   * 
   * @param context The context in which to find controllers.
   * @param dirname The directory name that should be used instead of the current directory the server is running in.
   */
  public async registerControllers(context: __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
    let items = await this.findItems<IInternalController>(context, dirname || this._config.cwd, this.controllerSuffix);
    for (let i = 0; i < items.length; ++i) {
      this._server.addControllers(items[i]);
    }
  }

  /**
   * Method is meant to register injectors into the internal server for use.
   * 
   * @param context The context in which to find injectors.
   * @param dirname The directory name that should be used instead of the current directory the server is running in.
   */
  public async registerInjectors(context: __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
    let items = await this.findItems<IInternalInjector>(context, dirname || this._config.cwd, this.injectorSuffix);
    for (let i = 0; i < items.length; ++i) {
      this._server.addInjectors(items[i]);
    }
  }

  /**
   * Method is meant to call start up functions to allow for modules to add in dependencies, injectors and middleware to the server.
   * 
   * @param context The context in which to find the start up files.
   * @param dirname The directory name that should be used instead o the current directory the server is running in.
   */
  public async startup(context: __WebpackModuleApi.RequireContext, dirname?: string): Promise<void> {
    let items = await this.findItems<(app: IApplication) => void | Promise<void>>(context, dirname || this._config.cwd, this.startUpSuffix);
    for (let i = 0; i < items.length; ++i) {
      const result = items[i](this);
      if (isPromise(result)) {
        await result;
      }
    }
  }

  /**
   * Helper method is meant to find items either in the file system or using webpacks require context to get all the
   * Controllers and Injectors.
   * 
   * @param context The context in which to find various controllers and injectors.
   * @param dirname The directory name that should be used instead of the current directory the server is running in.
   * @param type The type of controller/injector we are trying to find.
   */
  private findItems<T>(context: __WebpackModuleApi.RequireContext, dirname: string, type: string): Promise<T[]> {
    return new Promise<T[]>((resolve, reject) => {
      let items: any[] = [];
      let keys = context.keys();
      for (let i = 0; i < keys.length; ++i) {
        let obj = context(keys[i]);
        let objKeys = Object.keys(obj);
        for (let j = 0; j < objKeys.length; ++j) {
          items.push(obj[objKeys[j]]);
        }
      }
      resolve(items);
    });
  }
}