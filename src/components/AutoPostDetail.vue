<template>
  <v-card class="px-2 expand" v-if="!!post">
    <v-card-title>{{ post.userTitle }}</v-card-title>

    <v-img
      max-height="750px"
      contain
      lazy-src="https://jsns.dealerappcenter.com/img/default_vehicle_icons/default-inventory-image-car-med.jpg"
      :src="currentImage"
    ></v-img>

    <v-card-text>
      <v-row class="mb-2 thumbnail-row" align="center" no-gutters>
        <v-col class="text-right" cols="1">
          <v-btn
            :disabled="thumbnailPage === 0"
            @click="thumbnailPage--"
            elevation="0"
            icon
            small
          >
            <v-icon color="black">mdi-chevron-left</v-icon>
          </v-btn>
        </v-col>

        <v-col cols="10">
          <v-row no-gutters>
            <v-col
              :class="index === post.postImages.length - 1 ? null : 'pr-2'"
              v-for="(postImage, index) in thumbnailsOnPage"
              :key="postImage.postImageId"
              cols="6"
              align="center"
            >
              <v-img
                class="thumbnail"
                @click="imageIndex = index"
                lazy-src="https://jsns.dealerappcenter.com/img/default_vehicle_icons/default-inventory-image-car-med.jpg"
                :src="postImage.thumbnailUrl"
              ></v-img>
            </v-col>
          </v-row>
        </v-col>

        <v-col class="text-left" cols="1">
          <v-btn
            :disabled="
              !(
                post.postImages.length >
                thumbnailPage * thumbnailsPerPage + thumbnailsPerPage
              )
            "
            @click="thumbnailPage++"
            elevation="0"
            icon
            small
          >
            <v-icon color="black">mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col>
          <v-simple-table>
            <template v-slot:default>
              <tbody>
                <tr v-for="property in Object.keys(post)" :key="property">
                  <td>{{ property }}</td>
                  <td>{{ post[property] }}</td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
const axios = require("axios");

export default {
  created: function () {
    const self = this;
    self.$store.dispatch("setLoading", true);

    axios
      .get("https://localhost:44309/AutoPosts/" + self.$route.params.postId)
      .then(function (response) {
        self.post = response.data;
        document.title = self.post.userTitle;
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
        self.$store.dispatch("setLoading", false);
      });
  },
  computed: {
    currentImage() {
      return this.post.postImages && this.post.postImages.length
        ? this.post.postImages[this.imageIndex].imageUrl
        : "https://jsns.dealerappcenter.com/img/default_vehicle_icons/default-inventory-image-car-med.jpg";
    },
    thumbnailsOnPage() {
      const self = this;
      const posts = [];

      for (let i = 0; i < self.post.postImages.length; i++) {
        if (
          i >= self.thumbnailPage * self.thumbnailsPerPage &&
          i <
            self.thumbnailPage * self.thumbnailsPerPage + self.thumbnailsPerPage
        ) {
          posts.push(self.post.postImages[i]);
        }
      }

      return posts;
    },
  },
  data: function () {
    return {
      post: null,
      imageIndex: 0,
      thumbnailPage: 0,
      thumbnailsPerPage: 2,
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
.v-card__title {
  justify-content: center;
}

.thumbnail-row {
  height: 150px;
}
.thumbnail {
  height: 150px;
}
</style>
