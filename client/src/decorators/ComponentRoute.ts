import Vue, { ComponentOptions} from 'vue';
import { Component } from 'vue-property-decorator';
import { RouteConfig } from 'vue-router';

type VueClass<V> = { new (...args: any[]): V & Vue } & typeof Vue

interface ComponentRouteOptions<V extends Vue> extends ComponentOptions<V> {
    route: RouteConfig;
}

function ComponentRoute(options: ComponentRouteOptions<Vue>): any {
    let processor = Component(options);
    return (...args: any[]) => {
        let Component = processor.apply(null, args);
        Component.__so_route = options.route;
        return Component;
    }
}

export { ComponentRoute };