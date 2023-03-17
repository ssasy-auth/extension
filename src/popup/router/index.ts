import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { AuthenticationGaurd } from '~/logic';
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
    component: () => import('~/popup/views/Start.vue')
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
  AuthenticationGaurd(to, from, next);
});

export default router;