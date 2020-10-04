<template>
  <v-container
    class="expand"
    fluid
  >
    <v-row
      v-if="posts.length === 0"
      class="expand d-flex align-center justify-center"
    >
      <h1>No Posts Found</h1>
    </v-row>
    <v-row
      justify="center"
      v-if="totalPages"
    >
      <v-col>
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="totalVisiblePages"
          :disabled="totalPages === 1"
        />
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col
        v-for="post in posts"
        :key="post.postId"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <AutoPost :post="post" />
      </v-col>
    </v-row>
    <v-row
      justify="center"
      v-if="totalPages > 1"
    >
      <v-col>
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="totalVisiblePages"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from "axios";

export default {
  components: {
    AutoPost: () => import("./AutoPost.vue"),
  },
  watch: {
    "$route.query": function () {
      this.updatePosts();
    },
    page: function () {
      this.updatePosts();
    },
  },
  computed: {
    totalPages() {
      const self = this;
      return Math.ceil(self.totalResults / self.pageSize);
    },
  },
  created: function () {
    this.updatePosts();
  },
  methods: {
    updatePosts() {
      const self = this;

      self.$store.dispatch("setLoading", true);

      let url = "https://localhost:44309/Search/Autos";

      if (self.$route.query.filter) {
        url += self.$route.query.filter;
      }

      const params = {
        query: self.$route.query.query,
        page: self.page,
        pageSize: self.pageSize,
      };

      axios
        .get(url, { params })
        .then(function (response) {
          self.posts = response.data.results;
          self.totalResults = response.data.total;
        })
        .catch(function (error) {
          self.totalResults = 0;
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
      page: 1,
      pageSize: 10,
      totalResults: 0,
      totalVisiblePages: 5,
    };
  },
};
</script>

<style scoped>
.expand {
  height: 100%;
}
</style>
