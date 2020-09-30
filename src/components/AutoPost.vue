<template>
  <v-card flat class="rounded d-flex flex-column post pa-2" align="center">
    <v-row
      class="vehicle-header pb-2"
      justify="center"
      align="center"
      no-gutters
    >
      <v-col class="vehicle-header-text" justify="center" cols="10">
        <span>{{ post.systemTitle }}</span>
      </v-col>
      <v-col cols="2">
        <v-menu top offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn small icon fab v-bind="attrs" v-on="on">
              <v-icon color="white">mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item v-for="(action, index) in actions" :key="index">
              <v-icon>{{ action.icon }}</v-icon>
              <v-list-item-title class="pl-2">{{
                action.label
              }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <v-divider />

    <v-row
      align="center"
      :class="!post.images || post.images.length == 1 ? 'pa-2' : null"
      class="post-image"
      no-gutters
    >
      <v-col v-if="containsMultipleImages" cols="1">
        <v-btn @click="previousImage" elevation="0" icon x-small>
          <v-icon>mdi-chevron-left</v-icon>
        </v-btn>
      </v-col>
      <v-col :cols="containsMultipleImages ? 10 : 12">
        <v-img
          lazy-src="https://images.motorcar.com/foundation/controls/vehicle-icons/default-sedan.jpg"
          contain
          :src="currentImage"
        ></v-img>
      </v-col>
      <v-col v-if="containsMultipleImages" cols="1">
        <v-btn @click="nextImage" elevation="0" icon x-small>
          <v-icon>mdi-chevron-right</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-divider />

    <v-row class="post-bottom pt-2" justify="center" align="center" no-gutters>
      <v-col class="text-left" cols="3">
        <span v-if="post.price" class="price"
          >$ {{ post.price.toFixed(2) }}</span
        >
      </v-col>
      <v-col class="text-center" cols="3">
        <v-icon color="white" small class="pr-1">mdi-comment</v-icon>
        <span>{{ post.comments || 0 }}</span>
      </v-col>
      <v-col class="text-center" cols="3">
        <v-icon color="white" small class="pr-1">mdi-eye</v-icon>
        <span>{{ post.views || 0 }}</span>
      </v-col>
      <v-col class="text-right" cols="3">
        <span class="date">{{
          new Date(post.createdDate).toLocaleDateString()
        }}</span>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
      required: true,
      default: function () {
        return {};
      },
    },
  },
  computed: {
    currentImage() {
      return this.post.images && this.post.images.length
        ? this.post.images[this.imageIndex]
        : "https://images.motorcar.com/foundation/controls/vehicle-icons/default-sedan.jpg";
    },
    containsMultipleImages() {
      return this.post.images && this.post.images.length > 1;
    },
  },
  methods: {
    previousImage() {
      if (this.imageIndex) {
        this.imageIndex--;
      } else {
        this.imageIndex = this.post.images.length - 1;
      }
    },
    nextImage() {
      if (this.imageIndex != this.post.images.length - 1) {
        this.imageIndex++;
      } else {
        this.imageIndex = 0;
      }
    },
  },
  data: function () {
    return {
      imageIndex: 0,
      actions: [
        { label: "Watch", icon: "mdi-alarm" },
        { label: "Hide", icon: "mdi-eye-off" },
        { label: "Save", icon: "mdi-bookmark" },
      ],
    };
  },
};
</script>

<style scoped>
.vehicle-header {
  min-height: 50px;
  max-height: 50px;
  overflow: hidden;
}

.vehicle-header-text {
  overflow: hidden;
  max-height: 50px;
}

.post {
  height: 400px;
  color: white;
  background-color: #1976d2;
}

.post-image .v-image {
  max-height: 250px;
}

.post-bottom {
  min-height: 50px;
  max-height: 50px;
  font-size: smaller;
}
</style>
