import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import CreateAutoPost from "../components/CreateAutoPost.vue";
import Filter from "../components/Filter.vue";
import Posts from "../components/Posts.vue";

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
}, {
  path: "/Posts",
  name: "Posts",
  component: Posts
}];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;