import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Start from '~/popup/views/Start.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    name: 'start', 
    component: Start 
  }
];

const router = createRouter({
  history: createWebHistory('/dist/popup/index.html'),
  routes
});

export default router;