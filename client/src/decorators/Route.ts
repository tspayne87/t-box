import Vue from 'vue';

function Route<V extends Vue>(options: ComponentOptions<V> & ThisType<V>): <VC extends VueClass<V>>(target: VC) => VC
function Route<VC extends VueClass<Vue>>(target: VC): VC
function Route(options: ComponentOptions<Vue> | VueClass<Vue>): any {
  if (typeof options === 'function') {
    return componentFactory(options)
  }
  return function (Component: VueClass<Vue>) {
    return componentFactory(Component, options)
  }
}