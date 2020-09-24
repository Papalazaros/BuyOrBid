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
  methods: {
    handleSearch() {
      const self = this;

      if (self.$route.name === "Posts") {
        self.$router.push({ query: { query: self.query } });
      } else {
        self.$router.push({ path: "Posts", query: { query: self.query } });
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