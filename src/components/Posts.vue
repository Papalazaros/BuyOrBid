<template>
  <v-container class="expand" fluid>
    <div v-if="posts.length === 0" class="expand d-flex align-center justify-center">
      <h1>No Posts Found</h1>
    </div>
    <v-row v-else justify="center">
      <v-col v-for="post in posts" :key="post.postId" cols="12" sm="6" md="4" lg="3" xl="2">
        <AutoPost :post="post" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const axios = require("axios");

export default {
  components: {
    AutoPost: () => import("./AutoPost.vue"),
  },
  beforeMount: function () {
    const self = this;
    self.$store.dispatch("setLoading", true);

    axios
      .get("https://localhost:44309/Posts/Autos")
      .then(function (response) {
        self.posts = response.data;
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
        self.$store.dispatch("setLoading", false);
      });
  },
  data: function () {
    return {
      posts: [],
    };
  },
};
</script>

<style scoped>
.expand {
  height: 100%;
}
</style>
