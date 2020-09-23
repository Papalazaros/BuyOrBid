<template>
  <v-container class="expand" fluid>
    <div v-if="isLoading" class="expand d-flex align-center justify-center">
      <v-progress-circular size="128" indeterminate color="primary"></v-progress-circular>
    </div>
    <div v-else-if="posts.length === 0" class="expand d-flex align-center justify-center">
      <h1>No Posts Found</h1>
    </div>
    <v-row v-else justify="center">
      <v-col v-for="post in posts" :key="post.postId" cols="12" sm="6" md="4" lg="3" xl="2">
        <AutoPost :post="post" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const axios = require("axios");

/* eslint-disable no-debugger */
export default {
  components: {
    AutoPost: () => import("./AutoPost.vue"),
  },
  mounted: function () {
    const self = this;
    axios
      .get("https://localhost:44309/Posts/Autos")
      .then(function (response) {
        // handle success
        console.log(response);
        self.posts = response.data;
        self.isLoading = false;
      })
      .catch(function (error) {
        // handle error
        console.log(error);
        // self.posts = [];
        self.isError = true;
      })
      .then(function () {
        // always executed
        self.isLoading = false;
      });
  },
  data: function () {
    return {
      isLoading: true,
      isError: true,
      posts: [
        {
          vin: "YV149MTS6G2409804",
          images: [
            "https://upload.wikimedia.org/wikipedia/commons/f/f3/2019_Volvo_S60_R-Design_Edition_T5_Automatic_2.0.jpg",
            "https://cdn-ds.com/media/dfmodels/4208/MainImage-16152.png",
            "https://upload.wikimedia.org/wikipedia/commons/9/9b/2019_Mercedes-Benz_E220d_SE_Automatic_2.0_Front.jpg",
          ],
          views: 100,
          price: 1000,
          makeId: 3412,
          modelId: 40000,
          series: "S60/S60I",
          autoType: "Sedan",
          transmissionType: "Automatic",
          titleStatus: "Clean",
          color: "Black",
          doors: 4,
          horsepower: 302,
          displacementInLiters: 2,
          displacementInCc: 2000,
          fuelType: "Gasoline",
          driveType: "All",
          year: 2016,
          trim: "SVP9 POLESTAR SPECIAL EDITION",
          cylinders: 4,
          engineModel: "B4204T9",
          autoCondition: "Good",
          postId: 475,
          systemTitle:
            "2016 S60/S60I SVP9 POLESTAR SPECIAL EDITION 2L 4CYL 4DR",
          userTitle: "2016 S60/S60I SVP9 POLESTAR SPECIAL EDITION 2L 4CYL 4DR",
          createdByUserId: 1,
          createdDate: "2020-09-22T01:09:10.1420449+00:00",
          modifiedDate: "2020-09-22T01:09:10.1419427+00:00",
          isPublic: true,
          language: "English",
        },
      ],
    };
  },
};
</script>

<style scoped>
.expand {
  height: 100%;
}
</style>
