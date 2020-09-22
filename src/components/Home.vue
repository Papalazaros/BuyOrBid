<template>
  <Posts />
</template>

<script>
export default {
  components: {
    Posts: () => import("./Posts.vue"),
  },
};
</script>
