import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Start from '../views/Start.vue';
import Setup from '../views/Setup/Index.vue';
import SetupKeyVue from '../views/Setup/SetupKey.vue';
import SetupImportVue from '../views/Setup/SetupImport.vue';
import SetupStorageVue from '../views/Setup/SetupStorage.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    name: 'start', 
    component: Start 
  },
  {
    path: '/setup',
    name: 'setup',
    component: Setup
  },
  {
    path: '/setup/key',
    name: 'setup-key',
    component: SetupKeyVue
  },
  {
    path: '/setup/import',
    name: 'setup-import',
    component: SetupImportVue
  },
  {
    path: '/setup/storage',
    name: 'setup-storage',
    component: SetupStorageVue
  }
];

const router = createRouter({
  history: createWebHistory('/dist/options/index.html'),
  routes
});

export default router;