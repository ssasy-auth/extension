import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Start from '../views/Start.vue';
import Setup from '../views/Setup/Index.vue';
import SetupKey from '../views/Setup/SetupKey.vue';
import SetupImport from '../views/Setup/SetupImport.vue';
import SetupStorage from '../views/Setup/SetupStorage.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    name: 'start', 
    component: Start 
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => Setup
  },
  {
    path: '/setup/key',
    name: 'setup-key',
    component: () => SetupKey
  },
  {
    path: '/setup/import',
    name: 'setup-import',
    component: () => SetupImport
  },
  {
    path: '/setup/storage',
    name: 'setup-storage',
    component: () => SetupStorage
  }
];

const router = createRouter({
  history: createWebHistory('/dist/options/index.html'),
  routes
});

export default router;