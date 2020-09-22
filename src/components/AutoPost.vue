<template>
  <v-stepper v-model="e1">
    <v-stepper-header>
      <v-stepper-step :complete="e1 > 1" step="1">
        VIN
        <small>Optional</small>
      </v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step :complete="e1 > 2" step="2">Vehicle Information</v-stepper-step>
      <v-divider></v-divider>
      <v-stepper-step step="3">Contact Information</v-stepper-step>
    </v-stepper-header>

    <v-stepper-items>
      <v-stepper-content align="center" step="1">
        <v-container fluid class="my-12">
          <h1>Enter your VIN</h1>
          <v-text-field hide-details v-model.trim="vin" single-line outlined flat clearable />
        </v-container>

        <v-btn @click="cancel" color="error">Cancel</v-btn>
        <v-btn color="primary" class="ml-2" @click="e1 = 2">Continue</v-btn>
      </v-stepper-content>

      <v-stepper-content align="center" step="2">
        <v-row no-gutters class="my-12" color="grey lighten-1"></v-row>

        <v-btn @click="cancel" color="error">Cancel</v-btn>
        <v-btn color="secondary" class="mx-2" @click="e1 = 1">Back</v-btn>
        <v-btn color="primary" @click="e1 = 3">Continue</v-btn>
      </v-stepper-content>

      <v-stepper-content align="center" step="3">
        <v-row no-gutters class="my-12" color="grey lighten-1"></v-row>

        <v-btn @click="cancel" color="error">Cancel</v-btn>
        <v-btn color="secondary" class="mx-2" @click="e1 = 2">Back</v-btn>
        <v-btn color="success" @click="submit">Submit</v-btn>
      </v-stepper-content>
    </v-stepper-items>
  </v-stepper>
</template>

<script>
export default {
  methods: {
    submit() {},
    cancel() {
      this.$router.go(-1);
    },
  },
  data() {
    return {
      e1: 1,
      vin: null,
    };
  },
};
</script>