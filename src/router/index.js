import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import CreateAutoPost from "../components/CreateAutoPost.vue";
import Posts from "../components/Posts.vue";
import AutoPostDetail from "../components/AutoPostDetail.vue";
import NotFound from "../components/NotFound.vue";
import InternalServerError from "../components/InternalServerError.vue";

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
    path: "/Posts",
    name: "Posts",
    component: Posts
  },
  {
    path: "/Posts/:postId",
    name: "PostsDetail",
    component: AutoPostDetail
  },
  {
    path: "/NotFound",
    name: "NotFound",
    component: NotFound
  },
  {
    path: "/Error",
    name: "Error",
    component: InternalServerError
  },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;