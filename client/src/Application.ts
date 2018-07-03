import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

export class Application {
    private _routes: RouteConfig[] = [];

    public registerComponents(context: __WebpackModuleApi.RequireContext): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                let controllers: RouteConfig[] = [];
                let keys = context.keys();
                for (let i = 0; i < keys.length; ++i) {
                    let Component = context(keys[i]).default;
                    if (Component.__so_route) {
                        let route = <RouteConfig>Component.__so_route;
                        route.component = Component;
                        this._routes.push(route);
                    }
                }
            } catch(e) {
                reject(e);
            } finally {
                resolve();
            }
        });
    }

    public boot(): void {
        Vue.use(VueRouter);

        let router = new VueRouter({ mode: 'history', routes: this._routes });
        new Vue({
            el: '#app',
            router
        });
    }
}