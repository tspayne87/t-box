import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

// Get the routes from the router components in the modules
const context = require.context('../modules', true, /router\.ts$/)
let routes: RouteConfig[] = [];
let keys = context.keys();
for (let i = 0; i < keys.length; ++i) {
  let obj = context(keys[i]);
  let objKeys = Object.keys(obj);
  for (let j = 0; j < objKeys.length; ++j) {
    routes = routes.concat(obj[objKeys[j]]);
  }
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
