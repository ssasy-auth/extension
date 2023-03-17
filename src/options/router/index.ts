import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { AuthenticationGaurd } from '~/common/routes';
import HomeVue from '~/pages/Home.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    name: 'home', 
    component: HomeVue 
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('~/pages/Auth.vue')
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('~/pages/Setup/Index.vue')
  },
  {
    path: '/setup/key',
    name: 'setup-key',
    component: () => import('~/pages/Setup/SetupKey.vue')
  },
  {
    path: '/setup/import',
    name: 'setup-import',
    component: () => import('~/pages/Setup/SetupImport.vue')
  },
  {
    path: '/setup/storage',
    name: 'setup-storage',
    component: () => import('~/pages/Setup/SetupStorage.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'wildcard',
    component: () => import('~/pages/_.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/dist/options/index.html'),
  routes
});

router.beforeEach((to, from, next) => {
  AuthenticationGaurd(to, from, next);
});

export default router;