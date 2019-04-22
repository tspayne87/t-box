import { RouteConfig } from 'vue-router';

export class RouteContainer {
    public routes: RouteConfig[] = [];

    public registerRoute(config: string , component: () => Promise<any>);
    public registerRoute(config: RouteConfig, component: () => Promise<any>);
    public registerRoute(config: string | RouteConfig, component: () => Promise<any>) {
        if (typeof config === 'string') {
            this.routes.push(<RouteConfig>{
                path: config,
                component: component
            });
        } else {
            config.component = <any>component;
            this.routes.push(config);
        }
    }
}