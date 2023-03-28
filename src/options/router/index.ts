import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { KeyGuard, SessionGaurd } from '~/common/routes';
import HomeVue from '~/pages/Home.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    name: 'home', 
    component: HomeVue,
    beforeEnter: [ KeyGuard, SessionGaurd ]
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('~/pages/Auth.vue')
  },
  {
    path: '/key',
    name: 'key',
    component: () => import('~/pages/PublicKey.vue'),
    beforeEnter: [ KeyGuard, SessionGaurd ]
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('~/pages/Settings/Index.vue'),
    beforeEnter: [ KeyGuard, SessionGaurd ]
  },
  {
    path: '/settings/vault',
    name: 'settings-vault',
    component: () => import('~/pages/Settings/Vault.vue'),
    beforeEnter: [ KeyGuard, SessionGaurd ]
  },
  {
    path: '/settings/logs',
    name: 'settings-logs',
    component: () => import('~/pages/Settings/Logs.vue'),
    beforeEnter: [ KeyGuard, SessionGaurd ]
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

export default router;