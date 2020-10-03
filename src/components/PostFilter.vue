<template>
  <v-form class="pa-2" ref="form" v-model="valid">
    <v-row no-gutters justify="center">
      <h2 class>Advanced Search</h2>
    </v-row>

    <v-row no-gutters justify="center">
      <v-col
        cols="12"
        v-for="filter in availableFilters"
        :key="filter.propertyName"
        class="filter"
      >
        <div
          v-if="
            !(
              filter.propertyType === 'Nullable`1' &&
              filter.propertySubType === 'Boolean'
            ) || filter.propertyType === 'Boolean'
          "
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
        </div>
        <v-text-field
          v-model.trim="filters[filter.propertyName]"
          single-line
          outlined
          flat
          step="1"
          clearable
          hide-details
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
          hide-details
          :items="getAvailableValues[filter.propertyName]"
          :label="filter.propertyName"
          :rules="[rules.selectionLimit]"
          :item-text="getItemText"
          :item-value="getItemValue"
        />
        <v-checkbox
          class="checkbox pt-2"
          v-model="filters[filter.propertyName]"
          v-else-if="
            (filter.propertyType === 'Nullable`1' &&
              filter.propertySubType === 'Boolean') ||
            filter.propertyType === 'Boolean'
          "
          hide-details
          :label="filter.propertyName"
        ></v-checkbox>
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
              hide-details
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
    <v-row class="pt-2" no-gutters justify="center">
      <v-btn block :disabled="!valid" color="success" @click="handleFilter()"
        >Apply</v-btn
      >
    </v-row>
    <v-row class="pt-2" no-gutters justify="center">
      <v-btn block color="primary" @click="clearFilter()">Clear</v-btn>
    </v-row>
  </v-form>
</template>
<script>
export default {
  props: {
    availableFilters: {
      type: Array,
      required: true,
      default: function () {
        return [];
      },
    },
  },
  mounted: function () {
    const self = this;
    self.initializeDefaultFilters();
    self.initializeFiltersFromUrl();
    self.$refs.form.validate();
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
                  x.dependsOn.propertyValue.toString()
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
    initializeDefaultFilters() {
      const self = this;
      for (let i = 0; i < self.availableFilters.length; i++) {
        if (self.availableFilters[i].propertyType === "IEnumerable`1") {
          self.$set(self.filters, self.availableFilters[i].propertyName, []);
        } else {
          self.$set(self.filters, self.availableFilters[i].propertyName, null);
        }
      }
    },
    initializeFiltersFromUrl() {
      const self = this;
      const filterString = self.$route.query.filter;

      if (filterString) {
        const filterObjects = {};
        const filters = filterString.substring(1).split("&");

        for (let i = 0; i < filters.length; i++) {
          const filterKv = filters[i].split("=");
          const filterKey = filterKv[0];
          const filterValue = filterKv[1];
          const existingFilterValue = filterObjects[filterKey];

          if (existingFilterValue) {
            if (Array.isArray(self.filters[filterKey])) {
              filterObjects[filterKey] = [...existingFilterValue, filterValue];
            } else {
              filterObjects[filterKey] = [existingFilterValue, filterValue];
            }
          } else {
            if (Array.isArray(self.filters[filterKey])) {
              filterObjects[filterKey] = [filterValue];
            } else {
              filterObjects[filterKey] = filterValue;
            }
          }
        }

        Object.keys(filterObjects).forEach((key) => {
          self.filters[key] = filterObjects[key];
        });
      }
    },
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
      return item.value ? item.value.toString() : item;
    },
    getItemValue(item) {
      return item.key ? item.key.toString() : item;
    },
    clearFilter() {
      const self = this;
      self.initializeDefaultFilters();

      if (self.$route.query.filter !== null) {
        let query = Object.assign({}, self.$route.query);
        delete query.filter;
        self.$router.replace({ query }).catch(() => {});
      }
    },
    handleFilter() {
      const self = this;
      const searchParams = {};
      const additionalParams = [];

      Object.keys(self.filters).forEach((filterKey) => {
        const filterValue = self.filters[filterKey];

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

      if (self.$route.query.filter !== urlSearchParams) {
        self.$router.push({ query: { filter: urlSearchParams } });
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

.checkbox {
  margin: 0px;
  padding: 0px;
}
</style>