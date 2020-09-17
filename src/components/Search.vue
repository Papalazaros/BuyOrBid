<template>
  <div>
    <input v-model="query" type="search" />
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      query: null,
    };
  },
};
</script>

<style scoped>
</style>
