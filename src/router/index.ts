import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(async (to) => {
  if (to.name == 'cv') {
    document.getElementsByTagName("body")[0].style.background = "linear-gradient(to right, rgba(255,198,194,0.4), rgba(195,224,221,0.4), rgba(250,233,218,0.4)), black";
  }
  else {
    document.getElementsByTagName("body")[0].style.background = "black";
  }
})

export default router;
