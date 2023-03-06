import { createRouter, createWebHistory } from "vue-router";
import WelcomeView from "@/views/IndexView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "welcome",
      component: WelcomeView
    },
    {
      path: "/setup",
      name: "setup",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/SetupView.vue"),
      children: [
        {
          path: "",
          name: "setup-index",
          component: () => import("../views/setup/IndexView.vue")
        },
        {
          path: "backup",
          name: "setup-backup",
          component: () => import("../views/setup/BackupView.vue")
        },
        {
          path: "store",
          name: "setup-storage",
          component: () => import("../views/setup/StorageView.vue")
        }
      ]
    },
    {
      path: "/*",
      name: "wildcard",
      component: () => import("../views/ErrorView.vue")
    }
  ]
});

export default router;
