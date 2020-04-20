import { RouteConfig } from 'vue-router';

export const routes: Array<RouteConfig> = [
  {
    path: '/example',
    name: 'Example',
    component: () => import(/* webpackChunkName: "example" */ './views/Example.vue')
  }
];
