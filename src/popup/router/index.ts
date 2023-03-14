import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import StartVue from '~/pages/Start.vue';
import HomeVue from '~/pages/Home.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    name: 'start', 
    component: StartVue 
  },
  { 
    path: '/home', 
    name: 'home', 
    component: HomeVue 
  }
];

const router = createRouter({
  history: createWebHistory('/dist/popup/index.html'),
  routes
});

export default router;