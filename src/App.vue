<template>
  <v-app>
    <v-app-bar flat class="px-2" app color="primary">
      <router-link class="app-title d-none d-sm-block" to="/">
        <h2>BuyOrBid</h2>
      </router-link>
      <v-spacer />
      <Search />
      <v-spacer />
      <!-- <router-link to="/Filter">
        <v-icon color="white">mdi-filter</v-icon>
      </router-link> -->
      <v-icon
        :disabled="
          $store.getters.isLoading ||
          !(
            availableFilters &&
            availableFilters.length &&
            ($router.currentRoute.name == 'Home' ||
              $router.currentRoute.name == 'Posts')
          )
        "
        @click="filterDrawer = !filterDrawer"
        color="white"
        >mdi-filter</v-icon
      >
      <v-btn
        elevation="0"
        @click="dialog = !dialog"
        fab
        x-small
        color="primary"
      >
        <v-icon color="white">mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container
        fluid
        v-if="$store.getters.isLoading"
        class="expand d-flex align-center justify-center"
      >
        <v-progress-circular
          size="128"
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-container>

      <router-view v-show="!$store.getters.isLoading" />

      <v-dialog v-model="dialog" max-width="300">
        <CreatePost v-on:close-modal="dialog = false" />
      </v-dialog>

      <v-navigation-drawer
        width="500px"
        class="filter-drawer"
        v-model="filterDrawer"
        temporary
        fixed
        v-if="availableFilters && availableFilters.length"
        ><PostFilter :availableFilters="availableFilters" />
      </v-navigation-drawer>
    </v-main>
  </v-app>
</template>

<script>
import { getFilters } from "./api/axios-client";

export default {
  created: function () {
    const self = this;
    getFilters().then(function (response) {
      self.availableFilters = response.data;
    });
  },
  components: {
    Search: () => import("./components/Search.vue"),
    CreatePost: () => import("./components/CreatePost.vue"),
    PostFilter: () => import("./components/PostFilter.vue"),
  },
  data: function () {
    return {
      dialog: null,
      filterDrawer: false,
      loadingComplete: false,
      availableFilters: [],
    };
  },
};
</script>

<style>
.app-title {
  color: white !important;
  text-decoration: none;
}

.expand {
  height: 100%;
}
</style>
