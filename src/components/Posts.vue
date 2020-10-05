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
      no-gutters
      justify="center"
      v-if="totalPages"
    >
      <v-col>
        <v-pagination
          :value="page"
          @input="setPage"
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
        xl="2"
      >
        <AutoPost :post="post" />
      </v-col>
    </v-row>
    <v-row
      no-gutters
      justify="center"
      v-if="totalPages > 1"
    >
      <v-col>
        <v-pagination
          :value="page"
          @input="setPage"
          :length="totalPages"
          :total-visible="totalVisiblePages"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { execute } from "../api/axios-client";

export default {
  components: {
    AutoPost: () => import("./AutoPost.vue"),
  },
  watch: {
    "$route.query": function () {
      this.page = 1;
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
    const self = this;
    self.$store.dispatch("setLoading", true);
    self.updatePosts();
  },
  methods: {
    setPage(page) {
      const self = this;

      if (self.page != page) {
        self.page = page;
        self.updatePosts();
      }
    },
    updatePosts() {
      const self = this;

      let url = "Search/Autos";

      if (self.$route.query.filter) {
        url += self.$route.query.filter;
      }

      const params = {
        query: self.$route.query.query,
        page: self.page,
        pageSize: self.pageSize,
      };

      execute({ url, params })
        .then(function (response) {
          self.posts = response.data.results;
          self.totalResults = response.data.total;
        })
        .catch(function () {
          self.totalResults = 0;
        });
    },
  },
  data: function () {
    return {
      posts: [],
      page: 1,
      pageSize: 12,
      totalResults: 0,
      totalVisiblePages: 6,
    };
  },
};
</script>

<style scoped>
.expand {
  height: 100%;
}
</style>
