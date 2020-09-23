import Vue from "vue";
import VueRouter from "vue-router";

const Home = () => import( /* webpackChunkName: "group-home" */ "../components/Home.vue");
const CreateAutoPost = () => import( /* webpackChunkName: "group-create_post" */ "../components/CreateAutoPost.vue");
const Filter = () => import( /* webpackChunkName: "group-filter" */ "../components/Filter.vue");

Vue.use(VueRouter);

const routes = [{
  path: "/",
  name: "Home",
  component: Home
}, {
  path: "/CreateAutoPost",
  name: "CreateAutoPost",
  component: CreateAutoPost
}, {
  path: "/Filter",
  name: "Filter",
  component: Filter
}];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;