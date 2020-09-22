<template>
  <v-app>
    <v-app-bar flat class="px-2" app dark color="primary">
      <router-link class="app-title d-none d-sm-block" to="/">
        <h2>BuyOrBid</h2>
      </router-link>
      <v-spacer />
      <Search />
      <v-spacer />
      <router-link to="/Filter">
        <v-icon color="white">mdi-filter</v-icon>
      </router-link>
      <v-btn elevation="0" @click="dialog = !dialog" fab x-small color="primary">
        <v-icon color="white">mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
      <v-dialog v-model="dialog" max-width="300">
        <CreatePost v-on:close-modal="dialog = false" />
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script>
export default {
  components: {
    Search: () => import("./components/Search.vue"),
    CreatePost: () => import("./components/CreatePost.vue"),
  },
  data: function () {
    return {
      dialog: null,
    };
  },
};
</script>

<style scoped>
.app-title {
  color: white !important;
  text-decoration: none;
}
</style>