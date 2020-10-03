<template>
  <v-row no-gutters align="center">
    <v-col class="px-1" cols="12">
      <v-text-field
        v-model.trim="query"
        light
        hide-details
        single-line
        solo
        flat
        clearable
        label="Search all posts"
        append-icon="mdi-magnify"
        @click:append="handleSearch"
        @keydown.enter="handleSearch"
      />
    </v-col>
  </v-row>
</template>

<script>
export default {
  data: function () {
    return {
      query: null,
    };
  },
  watch: {
    "$route.query": function () {
      const self = this;
      self.query = self.$route.query.query;
    },
  },
  created: function () {
    const self = this;
    self.query = self.$route.query.query;
  },
  methods: {
    handleSearch() {
      const self = this;

      if (self.$route.name !== "Posts") {
        self.$router.push({
          path: "Posts",
          query: { query: self.query, filter: self.$route.query.filter },
        });
      } else if (self.$route.query.query !== self.query) {
        self.$router.push({
          query: { query: self.query, filter: self.$route.query.filter },
        });
      }
    },
  },
};
</script>
<style>
.v-toolbar__content {
  padding: 0px;
}
</style>