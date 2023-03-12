import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import StartVue from '../views/Start.vue';
import HomeVue from '../views/Home.vue';
import SetupVue from '../views/Setup/Index.vue';
import SetupKeyVue from '../views/Setup/SetupKey.vue';
import SetupImportVue from '../views/Setup/SetupImport.vue';
import SetupStorageVue from '../views/Setup/SetupStorage.vue';

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