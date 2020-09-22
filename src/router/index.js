import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import AutoPost from "../components/AutoPost.vue";
import Filter from "../components/Filter.vue";

Vue.use(VueRouter);

const routes = [{
  path: "/",
  name: "Home",
  component: Home
}, {
  path: "/AutoPost",
  name: "AutoPost",
  component: AutoPost
}, {
  path: "/Filter",
  name: "Filter",
  component: Filter
}];

const router = new VueRouter({
  routes,
  mode: 'history',
});

export default router;