import Vue, { Component, VueConstructor } from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

export class Application {
    private _routes: RouteConfig[] = [];
    private _components: { [key: string]: VueConstructor } = {};

    public registerRoute(config: string , component: () => Promise<any>);
    public registerRoute(config: RouteConfig, component: () => Promise<any>);
    public registerRoute(config: string | RouteConfig, component: () => Promise<any>) {
        if (typeof config === 'string') {
            this._routes.push(<RouteConfig>{
                path: config,
                component: component
            });
        } else {
            config.component = <any>component;
            this._routes.push(config);
        }
    }

    public registerComponent(name: string, component: VueConstructor) {
        this._components[name] = (<any>component).default || component;
    }

    public registerPlugins(context: __WebpackModuleApi.RequireContext): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let keys = context.keys();
                for (let i = 0; i < keys.length; ++i) {
                    let plugin = context(keys[i]).default;
                    plugin(this);
                }
            } catch (e) {
                reject(e);
            } finally {
                resolve();
            }
        });
    }

    public boot(): void {
        Vue.use(VueRouter);

        // Register global components
        let keys = Object.keys(this._components);
        for (let i = 0; i < keys.length; ++i) {
            Vue.component(keys[i], this._components[keys[i]]);
        }

        // Build the root component for the single page application.
        let router = new VueRouter({ mode: 'history', routes: this._routes });
        console.log({ Vue });
        new Vue({
            el: '#app',
            router
        });
    }
}