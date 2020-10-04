<template>
  <v-card
    class="pa-2"
    align="center"
  >
    <router-link to="/CreateAutoPost">
      <v-container
        fluid
        @click="$emit('close')"
        class="post"
      >
        <h3>Auto</h3>
        <v-icon
          x-large
          color="white"
        >
          mdi-car
        </v-icon>
      </v-container>
    </router-link>
  </v-card>
</template>

<script>
export default {};
</script>

<style scoped>
.post {
  color: white;
  background-color: #1976d2 !important;
  border-radius: 4px;
}
</style>
