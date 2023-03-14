import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import StartVue from '~/pages/Start.vue';
import HomeVue from '~/pages/Home.vue';
import SetupVue from '~/pages/Setup/Index.vue';
import SetupKeyVue from '~/pages/Setup/SetupKey.vue';
import SetupImportVue from '~/pages/Setup/SetupImport.vue';
import SetupStorageVue from '~/pages/Setup/SetupStorage.vue';

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
  },
  {
    path: '/setup',
    name: 'setup',
    component: SetupVue
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