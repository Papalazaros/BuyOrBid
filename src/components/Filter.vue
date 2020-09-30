<template>
  <v-form class="ma-2" ref="form" v-model="valid">
    <v-row no-gutters align="center" justify="center">
      <h2 class>Advanced Search</h2>
    </v-row>
    <v-divider class="my-2" />
    <v-row no-gutters>
      <v-col
        cols="12"
        md="6"
        lg="4"
        xl="3"
        v-for="filter in availableFilters"
        :key="filter.propertyName"
        class="filter px-2"
      >
        <div
          v-if="
            filters[filter.propertyName] &&
            Object.keys(filters[filter.propertyName]).length
          "
          class="property-header"
        >
          <h4>{{ filter.propertyName }}</h4>
        </div>
        <div class="property-header" v-else />
        <v-text-field
          v-model.trim="filters[filter.propertyName]"
          single-line
          outlined
          flat
          step="1"
          clearable
          :label="filter.propertyName"
          :type="
            filter.propertyType === 'Int32' ||
            filter.propertySubType === 'Int32'
              ? 'number'
              : 'text'
          "
          :rules="[rules.characterLimit, ...getRulesFromObject(filter.rules)]"
          v-if="
            (filter.propertyType === 'Nullable`1' &&
              (filter.propertySubType === 'String' ||
                filter.propertySubType === 'Int32')) ||
            filter.propertyType === 'String' ||
            filter.propertyType === 'Int32'
          "
        />
        <v-select
          v-else-if="
            filter.propertyType === 'IEnumerable`1' &&
            filter.availableValues &&
            filter.availableValues.length
          "
          v-model="filters[filter.propertyName]"
          chips
          multiple
          single-line
          flat
          outlined
          clearable
          :items="getAvailableValues[filter.propertyName]"
          :label="filter.propertyName"
          :rules="[rules.selectionLimit]"
          :item-text="getItemText"
          :item-value="getItemValue"
        />
        <v-menu
          v-model="menus[filter.propertyName]"
          :close-on-content-click="true"
          transition="scale-transition"
          offset-y
          min-width="250px"
          v-else-if="
            (filter.propertyType === 'Nullable`1' &&
              filter.propertySubType === 'DateTime') ||
            filter.propertyType === 'DateTime'
          "
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="filters[filter.propertyName]"
              v-bind="attrs"
              v-on="on"
              readonly
              single-line
              outlined
              flat
              clearable
              :label="filter.propertyName"
            />
          </template>
          <v-date-picker
            v-model="filters[filter.propertyName]"
            no-title
            scrollable
          />
        </v-menu>
      </v-col>
    </v-row>
    <v-row no-gutters class="my-2" align="center" justify="center">
      <v-btn :disabled="!valid" class="success" @click="getFilteredPosts"
        >Search</v-btn
      >
    </v-row>
  </v-form>
</template>
<script>
const axios = require("axios");

export default {
  created: function () {
    const self = this;
    self.$store.dispatch("setLoading", true);

    axios
      .get("https://localhost:44309/Filters")
      .then(function (response) {
        self.availableFilters = response.data;

        for (let i = 0; i < self.availableFilters.length; i++) {
          if (self.availableFilters[i].propertyType === "IEnumerable`1") {
            self.$set(self.filters, self.availableFilters[i].propertyName, []);
          } else {
            self.$set(
              self.filters,
              self.availableFilters[i].propertyName,
              null
            );
          }
        }

        self.$refs.form.validate();
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
        self.$store.dispatch("setLoading", false);
      });
  },
  computed: {
    getAvailableValues() {
      const self = this;
      const availableValues = {};

      for (let i = 0; i < self.availableFilters.length; i++) {
        if (
          self.availableFilters[i].availableValues &&
          self.availableFilters[i].availableValues.length
        ) {
          availableValues[
            self.availableFilters[i].propertyName
          ] = self.availableFilters[i].availableValues.filter((x) => {
            if (
              !x.dependsOn ||
              (x.dependsOn &&
                self.filters[x.dependsOn.propertyName] &&
                self.filters[x.dependsOn.propertyName].includes(
                  x.dependsOn.propertyValue
                ))
            ) {
              return x;
            }
          });
        }
      }

      return availableValues;
    },
  },
  methods: {
    getRulesFromObject(rulesObjects) {
      if (!rulesObjects || !rulesObjects.length) return [];

      const rules = [];

      for (let i = 0; i < rulesObjects.length; i++) {
        const rule = rulesObjects[i];

        if (rule.type == "Required") {
          rules.push((value) => !!value || "Required");
        } else if (rule.type == "Range") {
          rules.push(
            (value) =>
              !value ||
              (value <= rule.valueTo && value >= rule.valueFrom) ||
              `Only values between ${rule.valueFrom} and ${rule.valueTo} are allowed`
          );
        } else if (rule.type == "Number") {
          rules.push(
            (value) => !value || !isNaN(value) || "You must enter a number"
          );
        }
      }

      return rules;
    },
    getItemText(item) {
      return item.value || item;
    },
    getItemValue(item) {
      return item.key || item;
    },
    getFilteredPosts() {
      const searchParams = {};
      const additionalParams = [];

      Object.keys(this.filters).forEach((filterKey) => {
        const filterValue = this.filters[filterKey];

        if (
          filterValue != null &&
          filterValue != undefined &&
          filterValue.length !== 0
        ) {
          if (Array.isArray(filterValue)) {
            for (let i = 0; i < filterValue.length; i++) {
              additionalParams.push({
                key: filterKey,
                value: filterValue[i],
              });
            }
          } else {
            searchParams[filterKey] = filterValue;
          }
        }
      });

      let urlSearchParams = "?" + new URLSearchParams(searchParams).toString();

      if (additionalParams.length) {
        if (urlSearchParams.length !== 1) {
          urlSearchParams += "&";
        }

        urlSearchParams += additionalParams
          .map((paramObj) => {
            return encodeURI(`${paramObj.key}=${paramObj.value}`);
          })
          .join("&");
      }

      if (urlSearchParams.length !== 1) {
        console.log(urlSearchParams);
      }
    },
  },
  data: function () {
    return {
      menus: {},
      filters: {},
      valid: null,
      rules: {
        characterLimit: (value) =>
          !value || value.length <= 20 || "Max 20 characters",
        selectionLimit: (value) =>
          !value.length || value.length <= 10 || "Max 10 selections",
      },
      availableFilters: [],
    };
  },
};
</script>
<style scoped>
.filter {
  margin: 0;
  padding: 0;
}

.property-header {
  height: 25px;
  color: #1976d2;
}
</style>