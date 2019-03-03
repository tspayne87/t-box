import Vue, { VueConstructor, ComponentOptions } from 'vue';
import { upperFirst, camelCase } from 'lodash';
import VueRouter, { RouteConfig } from 'vue-router';
import { RouteContainer } from './routeContainer';

export class Application {
    private _routeContainer: RouteContainer;
    private _components: { [key: string]: any };

    constructor() {
        this._routeContainer = new RouteContainer();
        this._components = {};
    }

    public registerComponents(ctx: __WebpackModuleApi.RequireContext) {
        const keys = ctx.keys();
        for (let i = 0; i < keys.length; ++i) {
            const config = ctx(keys[i]);
            const arrayPath = keys[i].replace(/^\.\//, '').replace(/\.\w+$/, '').split('/');
            const name = upperFirst(camelCase(arrayPath.slice(arrayPath.length - 2).join('/')));
            this._components[name] = config.default || config;
        }
    }

    public registerPages(ctx: __WebpackModuleApi.RequireContext) {
        let keys = ctx.keys();
        for (let i = 0; i < keys.length; ++i) {
            let plugin = ctx(keys[i]).default;
            plugin(this._routeContainer);
        }
    }

    public generateRouter(Vue: VueConstructor<Vue>): VueRouter {
        Vue.use(VueRouter);
        return new VueRouter({ mode: 'history', routes: this._routeContainer.routes });
    }

    public install(Vue: VueConstructor<Vue>, options?: any) {
        let componentKeys = Object.keys(this._components);
        for (let i = 0; i < componentKeys.length; ++i) {
            Vue.component(componentKeys[i], this._components[componentKeys[i]]);
        }
    }
}