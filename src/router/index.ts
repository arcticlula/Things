import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import { useUserStore } from "../stores/user";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: "/",
    redirect: "/things"
  },
  {
    path: "/:view(things|storages)",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: "/unassigned",
    name: "unassigned",
    component: () => import("../views/UnassignedThingsView.vue"),
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();

  // Wait for auth initialization if not yet initialized
  if (!userStore.isInitialized) {
    await userStore.initializeAuth();
  }

  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login');
  }
  else if (to.path === '/login' && userStore.isAuthenticated) {
    next('/things');
  }
  else {
    next();
  }
});

export default router;