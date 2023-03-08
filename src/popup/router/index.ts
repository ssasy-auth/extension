import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Start from '~/options/views/Start.vue';

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