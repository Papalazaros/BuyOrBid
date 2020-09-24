<template>
  <v-container class="expand" fluid>
    <div
      v-if="posts.length === 0"
      class="expand d-flex align-center justify-center"
    >
      <h1>No Posts Found</h1>
    </div>
    <div v-else>
      <v-row align="end" justify="center">
        <h1>Test</h1>
      </v-row>
      <v-row justify="center">
        <v-col
          v-for="post in posts"
          :key="post.postId"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          xl="2"
        >
          <AutoPost :post="post" />
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script>
const axios = require("axios");

export default {
  components: {
    AutoPost: () => import("./AutoPost.vue"),
  },
  watch: {
    "$route.query": function () {
      this.updatePosts();
    },
  },
  beforeMount: function () {
    this.updatePosts();
  },
  methods: {
    updatePosts() {
      const self = this;
      self.$store.dispatch("setLoading", true);

      let url;

      if (self.$route.query && self.$route.query.query) {
        url =
          "https://localhost:44309/Search/Autos?query=" +
          self.$route.query.query;
      } else {
        url = "https://localhost:44309/Posts/Autos";
      }

      axios
        .get(url)
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
