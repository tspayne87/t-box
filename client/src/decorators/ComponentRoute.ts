import Vue, { ComponentOptions} from 'vue';
import { Component } from 'vue-property-decorator';
import { RouteConfig } from 'vue-router';

type VueClass<V> = { new (...args: any[]): V & Vue } & typeof Vue

interface ComponentRouteOptions<V extends Vue> extends ComponentOptions<V> {
    route?: RouteConfig;
}

function ComponentRoute<V extends Vue>(options: ComponentRouteOptions<V> & ThisType<V>): <VC extends VueClass<V>>(target: VC) => VC
function ComponentRoute<VC extends VueClass<Vue>>(target: VC): VC
function ComponentRoute(options: ComponentRouteOptions<Vue> | VueClass<Vue>): any {
    var component = Component(options);
    console.log(component);
    return component;
}

export { ComponentRoute };