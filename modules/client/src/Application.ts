import Vue, { VueConstructor, ComponentOptions } from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

export class Application {
    private _routes: RouteConfig[] = [];

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
        Vue.component(name, (<any>component).default || component);
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

    public generateRouter(Vue: VueConstructor<Vue>): VueRouter {
        Vue.use(VueRouter);
        return new VueRouter({ mode: 'history', routes: this._routes });
    }
}