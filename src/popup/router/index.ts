import { createRouter, createWebHistory } from 'vue-router';
import { AuthenticationGaurd, MessengerGuard } from '~/common/routes';
import type { RouteRecordRaw } from 'vue-router';
import HomeVue from '~/pages/Home.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '/', 
    name: 'home', 
    component: HomeVue,
    beforeEnter: [ AuthenticationGaurd ]
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('~/popup/views/Start.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('~/pages/Auth.vue')
  },
  {
    path: '/request',
    name: 'request',
    component: () => import('~/pages/Request.vue'),
    beforeEnter: [ AuthenticationGaurd ]
  },
  {
    path: '/key',
    name: 'key',
    component: () => import('~/pages/PublicKey.vue'),
    beforeEnter: [ AuthenticationGaurd ]
  },
  {
    path: '/settings/key',
    name: 'settings-key',
    component: () => import('~/pages/Settings/PublicKey.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'wildcard',
    component: () => import('~/pages/_.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/dist/popup/index.html'),
  routes
});

router.beforeEach((to, from, next) => {
  // handle messenger routing
  MessengerGuard(to, from, next);
});

export default router;