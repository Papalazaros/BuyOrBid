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
          v-if="filters[filter.propertyName] && Object.keys(filters[filter.propertyName]).length"
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
          :type="filter.propertyType === 'Int32' || filter.propertySubType === 'Int32' ? 'number' : 'text'"
          :rules="[rules.characterLimit, ...getRulesFromObject(filter.rules)]"
          v-if="(filter.propertyType === 'Nullable`1' && (filter.propertySubType === 'String' || filter.propertySubType === 'Int32')) || filter.propertyType === 'String' || filter.propertyType === 'Int32'"
        />
        <v-select
          v-else-if="filter.propertyType === 'IEnumerable`1' && filter.availableValues && filter.availableValues.length"
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
          v-else-if="(filter.propertyType === 'Nullable`1' && filter.propertySubType === 'DateTime') || filter.propertyType === 'DateTime'"
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
          <v-date-picker v-model="filters[filter.propertyName]" no-title scrollable />
        </v-menu>
      </v-col>
    </v-row>
    <v-row no-gutters class="my-2" align="center" justify="center">
      <v-btn :disabled="!valid" class="success" @click="getFilteredPosts">Search</v-btn>
    </v-row>
  </v-form>
</template>
<script>
/* eslint-disable no-debugger */
export default {
  beforeMount: function () {
    for (let i = 0; i < this.availableFilters.length; i++) {
      if (this.availableFilters[i].propertyType === "IEnumerable`1") {
        this.$set(this.filters, this.availableFilters[i].propertyName, []);
      } else {
        this.$set(this.filters, this.availableFilters[i].propertyName, null);
      }
    }
  },
  mounted: function () {
    this.$refs.form.validate();
  },
  computed: {
    getAvailableValues() {
      const availableValues = {};

      for (let i = 0; i < this.availableFilters.length; i++) {
        if (
          this.availableFilters[i].availableValues &&
          this.availableFilters[i].availableValues.length
        ) {
          availableValues[
            this.availableFilters[i].propertyName
          ] = this.availableFilters[i].availableValues.filter((x) => {
            if (
              !x.dependsOn ||
              (x.dependsOn &&
                this.filters[x.dependsOn.propertyName] &&
                this.filters[x.dependsOn.propertyName].includes(
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
      availableFilters: [
        {
          propertyName: "Vin",
          propertyType: "String",
        },
        {
          propertyName: "Makes",
          propertyType: "IEnumerable`1",
          propertySubType: "Int32",
          availableValues: [
            {
              key: 3374,
              value: "ACG",
            },
            {
              key: 3349,
              value: "ACURA",
            },
            {
              key: 3254,
              value: "ALLMAND BROTHERS",
            },
            {
              key: 3550,
              value: "ALLMAND BROTHERS",
            },
            {
              key: 2980,
              value: "ALPHA PRODUCTS INTERNATIONAL",
            },
            {
              key: 3201,
              value: "AMERICAN IRONHORSE",
            },
            {
              key: 3497,
              value: "AMERICAN IRONHORSE",
            },
            {
              key: 3259,
              value: "ARMBRUSTER STAGEWAY",
            },
            {
              key: 3555,
              value: "ARMBRUSTER STAGEWAY",
            },
            {
              key: 3190,
              value: "ARMOR LITE EXCEL, LLC",
            },
            {
              key: 3486,
              value: "ARMOR LITE EXCEL, LLC",
            },
            {
              key: 2977,
              value: "ASTON MARTIN",
            },
            {
              key: 3268,
              value: "ATK",
            },
            {
              key: 3564,
              value: "ATK",
            },
            {
              key: 3396,
              value: "AUDI",
            },
            {
              key: 2978,
              value: "AUTOCAR",
            },
            {
              key: 3221,
              value: "BAJAJ AUTO",
            },
            {
              key: 3517,
              value: "BAJAJ AUTO",
            },
            {
              key: 3246,
              value: "BALKO",
            },
            {
              key: 3542,
              value: "BALKO",
            },
            {
              key: 3436,
              value: "BEARCAT",
            },
            {
              key: 3426,
              value: "BEDARD TANKERS INC",
            },
            {
              key: 3441,
              value: "BELLACAR",
            },
            {
              key: 3397,
              value: "BENTLEY",
            },
            {
              key: 3403,
              value: "BLUE BIRD",
            },
            {
              key: 3372,
              value: "BMW",
            },
            {
              key: 3266,
              value: "BOOM",
            },
            {
              key: 3562,
              value: "BOOM",
            },
            {
              key: 3440,
              value: "BOURGET'S",
            },
            {
              key: 3428,
              value: "BRENNER",
            },
            {
              key: 3381,
              value: "BUELL",
            },
            {
              key: 3363,
              value: "BUICK",
            },
            {
              key: 3445,
              value: "BULK",
            },
            {
              key: 3362,
              value: "CADILLAC",
            },
            {
              key: 3220,
              value: "CAGIVA MOTOR S.P.A",
            },
            {
              key: 3516,
              value: "CAGIVA MOTOR S.P.A",
            },
            {
              key: 3345,
              value: "CAN-AM",
            },
            {
              key: 3410,
              value: "CATERPILLAR",
            },
            {
              key: 3418,
              value: "CHAMPION HOME BUILDERS INC.",
            },
            {
              key: 3231,
              value: "CHANGZHOU YAMASAKI MOTORCYCLE CO.",
            },
            {
              key: 3527,
              value: "CHANGZHOU YAMASAKI MOTORCYCLE CO.",
            },
            {
              key: 3226,
              value: "CHEETA",
            },
            {
              key: 3522,
              value: "CHEETA",
            },
            {
              key: 3188,
              value: "CHESSLINE, INC.",
            },
            {
              key: 3484,
              value: "CHESSLINE, INC.",
            },
            {
              key: 3364,
              value: "CHEVROLET",
            },
            {
              key: 3466,
              value: "CHONGQING ZONGSHEN AUTOMOTIVE INDUSTRY CO., LTD.",
            },
            {
              key: 3351,
              value: "CHRYSLER",
            },
            {
              key: 3442,
              value: "CLASSIC ROADSTERS",
            },
            {
              key: 3451,
              value: "CLASSIC TRAILERS, INC",
            },
            {
              key: 3357,
              value: "CLUB CAR",
            },
            {
              key: 3205,
              value: "COBRA INDUSTRIES",
            },
            {
              key: 3501,
              value: "COBRA INDUSTRIES",
            },
            {
              key: 3247,
              value: "CORRECT CRAFT INC",
            },
            {
              key: 3543,
              value: "CORRECT CRAFT INC",
            },
            {
              key: 3376,
              value: "COUNTRY COACH",
            },
            {
              key: 3197,
              value: "CPS TRAILER COMPANY",
            },
            {
              key: 3493,
              value: "CPS TRAILER COMPANY",
            },
            {
              key: 3230,
              value: "CRANE CARRIER COMPANY",
            },
            {
              key: 3526,
              value: "CRANE CARRIER COMPANY",
            },
            {
              key: 3252,
              value: "CROSLEY",
            },
            {
              key: 3548,
              value: "CROSLEY",
            },
            {
              key: 3425,
              value: "CROSLEY TRAILERS",
            },
            {
              key: 3565,
              value: "CROWN COACH CORPORATION",
            },
            {
              key: 3385,
              value: "CRUISER RV",
            },
            {
              key: 3437,
              value: "CRUZER",
            },
            {
              key: 3193,
              value: "DENZEL",
            },
            {
              key: 3489,
              value: "DENZEL",
            },
            {
              key: 3225,
              value: "DESPERADO",
            },
            {
              key: 3521,
              value: "DESPERADO",
            },
            {
              key: 3350,
              value: "DODGE",
            },
            {
              key: 3206,
              value: "DOOHAN",
            },
            {
              key: 3502,
              value: "DOOHAN",
            },
            {
              key: 2979,
              value: "DOONAN SPECIALIZED TRAILER",
            },
            {
              key: 3394,
              value: "DOOSAN",
            },
            {
              key: 3248,
              value: "DRYDOCK",
            },
            {
              key: 3544,
              value: "DRYDOCK",
            },
            {
              key: 3392,
              value: "DUCATI",
            },
            {
              key: 3249,
              value: "EAGER BEAVER",
            },
            {
              key: 3545,
              value: "EAGER BEAVER",
            },
            {
              key: 3423,
              value: "ELECTRA MECCANICA VEHICLES CORP.",
            },
            {
              key: 3222,
              value: "ELECTRO-TECHNOLOGIES",
            },
            {
              key: 3518,
              value: "ELECTRO-TECHNOLOGIES",
            },
            {
              key: 3265,
              value: "EUROSTYLE",
            },
            {
              key: 3561,
              value: "EUROSTYLE",
            },
            {
              key: 3256,
              value: "EZ LOADER CUSTOM BOAT TRAILERS",
            },
            {
              key: 3552,
              value: "EZ LOADER CUSTOM BOAT TRAILERS",
            },
            {
              key: 3458,
              value: "EZ LOADER WIDTH SERIES",
            },
            {
              key: 3456,
              value: "EZGO",
            },
            {
              key: 3182,
              value: "EZL MODEL",
            },
            {
              key: 3478,
              value: "EZL MODEL",
            },
            {
              key: 3375,
              value: "FORD",
            },
            {
              key: 3401,
              value: "FOREST RIVER",
            },
            {
              key: 3186,
              value: "FORSYTHE & DOWIS RIDES, INC.",
            },
            {
              key: 3482,
              value: "FORSYTHE & DOWIS RIDES, INC.",
            },
            {
              key: 3204,
              value: "FOSTI",
            },
            {
              key: 3500,
              value: "FOSTI",
            },
            {
              key: 3371,
              value: "FREIGHTLINER",
            },
            {
              key: 3431,
              value: "FRONTLINE",
            },
            {
              key: 3438,
              value: "GANGTIEXIA",
            },
            {
              key: 3261,
              value: "GARLOCK TRAILERS",
            },
            {
              key: 3557,
              value: "GARLOCK TRAILERS",
            },
            {
              key: 3415,
              value: "GEELY",
            },
            {
              key: 3421,
              value: "GENERAL PURPOSE VEHICLES",
            },
            {
              key: 3461,
              value: "GENUINE",
            },
            {
              key: 3393,
              value: "GENUINE SCOOTERS",
            },
            {
              key: 3199,
              value: "GENZE",
            },
            {
              key: 3495,
              value: "GENZE",
            },
            {
              key: 3353,
              value: "GMC",
            },
            {
              key: 3234,
              value: "GRUMMAN OLSON",
            },
            {
              key: 3530,
              value: "GRUMMAN OLSON",
            },
            {
              key: 3235,
              value: "HACKNEY AND SONS, INC.",
            },
            {
              key: 3531,
              value: "HACKNEY AND SONS, INC.",
            },
            {
              key: 3219,
              value: "HARLEY DAVIDSON",
            },
            {
              key: 3515,
              value: "HARLEY DAVIDSON",
            },
            {
              key: 3406,
              value: "HINO",
            },
            {
              key: 3258,
              value: "HOLSCLAW BROS. INC",
            },
            {
              key: 3554,
              value: "HOLSCLAW BROS. INC",
            },
            {
              key: 3348,
              value: "HONDA",
            },
            {
              key: 3180,
              value: "HONGDU",
            },
            {
              key: 3476,
              value: "HONGDU",
            },
            {
              key: 3439,
              value: "HUNG DAO CONTAINER CO",
            },
            {
              key: 3383,
              value: "HYUNDAI",
            },
            {
              key: 3412,
              value: "IC BUS",
            },
            {
              key: 3422,
              value: "ICON ELECTRIC VEHICLES",
            },
            {
              key: 3354,
              value: "INFINITI",
            },
            {
              key: 3414,
              value: "INTERNATIONAL",
            },
            {
              key: 3232,
              value: "INTERSTATE MANUFACTURING",
            },
            {
              key: 3528,
              value: "INTERSTATE MANUFACTURING",
            },
            {
              key: 3384,
              value: "ISUZU",
            },
            {
              key: 3196,
              value: "JAGUAR",
            },
            {
              key: 3365,
              value: "JAGUAR",
            },
            {
              key: 3356,
              value: "JEEP",
            },
            {
              key: 3429,
              value: "JERR-DAN",
            },
            {
              key: 3463,
              value: "JIANSHE",
            },
            {
              key: 3453,
              value: "JINGLONG",
            },
            {
              key: 3452,
              value: "JNEN",
            },
            {
              key: 3263,
              value: "JOHN DEERE",
            },
            {
              key: 3559,
              value: "JOHN DEERE",
            },
            {
              key: 3211,
              value: "JONWAY",
            },
            {
              key: 3507,
              value: "JONWAY",
            },
            {
              key: 3212,
              value: "KARAVAN TRAILER",
            },
            {
              key: 3508,
              value: "KARAVAN TRAILER",
            },
            {
              key: 3405,
              value: "KAWASAKI",
            },
            {
              key: 3400,
              value: "KENWORTH",
            },
            {
              key: 3402,
              value: "KIA",
            },
            {
              key: 3424,
              value: "KSM ENTERPRISES, INC",
            },
            {
              key: 3179,
              value: "KY",
            },
            {
              key: 3475,
              value: "KY",
            },
            {
              key: 3367,
              value: "LAND ROVER",
            },
            {
              key: 3407,
              value: "LEXUS",
            },
            {
              key: 3377,
              value: "LINCOLN",
            },
            {
              key: 3198,
              value: "LINHAI",
            },
            {
              key: 3494,
              value: "LINHAI",
            },
            {
              key: 3257,
              value: "LOAD RITE",
            },
            {
              key: 3553,
              value: "LOAD RITE",
            },
            {
              key: 3194,
              value: "LOJO",
            },
            {
              key: 3490,
              value: "LOJO",
            },
            {
              key: 3430,
              value: "LONDON",
            },
            {
              key: 3236,
              value: "LONG TRAILER COMPANY",
            },
            {
              key: 3532,
              value: "LONG TRAILER COMPANY",
            },
            {
              key: 3433,
              value: "LORGANO",
            },
            {
              key: 3379,
              value: "LOTUS",
            },
            {
              key: 3177,
              value: "LUJO",
            },
            {
              key: 3473,
              value: "LUJO",
            },
            {
              key: 3360,
              value: "MACK",
            },
            {
              key: 3366,
              value: "MASERATI",
            },
            {
              key: 3443,
              value: "MASTERCRAFT BOAT COMPANY",
            },
            {
              key: 3347,
              value: "MAZDA",
            },
            {
              key: 3435,
              value: "MCNEILUS",
            },
            {
              key: 3370,
              value: "MERCEDES-BENZ",
            },
            {
              key: 3378,
              value: "MERCURY",
            },
            {
              key: 3237,
              value: "METZGER MACHINE & ENGINEERING",
            },
            {
              key: 3533,
              value: "METZGER MACHINE & ENGINEERING",
            },
            {
              key: 3373,
              value: "MINI",
            },
            {
              key: 3191,
              value: "MISHOZUKI",
            },
            {
              key: 3487,
              value: "MISHOZUKI",
            },
            {
              key: 3238,
              value: "MITCHELL INDUSTRIES INC",
            },
            {
              key: 3534,
              value: "MITCHELL INDUSTRIES INC",
            },
            {
              key: 3361,
              value: "MITSUBISHI",
            },
            {
              key: 3416,
              value: "MITSUBISHI FUSO",
            },
            {
              key: 3178,
              value: "ML",
            },
            {
              key: 3474,
              value: "ML",
            },
            {
              key: 3240,
              value: "MOODY",
            },
            {
              key: 3536,
              value: "MOODY",
            },
            {
              key: 3208,
              value: "MOONRA",
            },
            {
              key: 3504,
              value: "MOONRA",
            },
            {
              key: 3185,
              value: "MORITZ INC.",
            },
            {
              key: 3481,
              value: "MORITZ INC.",
            },
            {
              key: 3395,
              value: "MOTO GUZZI",
            },
            {
              key: 3427,
              value: "MOTORIZED MANUFACTURING INC",
            },
            {
              key: 3462,
              value: "MUNRO",
            },
            {
              key: 3380,
              value: "NAVISTAR",
            },
            {
              key: 3192,
              value: "NAZAXX",
            },
            {
              key: 3488,
              value: "NAZAXX",
            },
            {
              key: 3469,
              value: "NEW WAVE",
            },
            {
              key: 3233,
              value: "NEWMAN'S MANUFACTURING INCORPORATED",
            },
            {
              key: 3529,
              value: "NEWMAN'S MANUFACTURING INCORPORATED",
            },
            {
              key: 3471,
              value: "NINGBO DALONG SMOOTH LOCOMOTIVE INDUSTRY CO., LTD.",
            },
            {
              key: 3352,
              value: "NISSAN",
            },
            {
              key: 3467,
              value: "NIU",
            },
            {
              key: 3387,
              value: "NOVABUS",
            },
            {
              key: 3209,
              value: "NUMI",
            },
            {
              key: 3505,
              value: "NUMI",
            },
            {
              key: 3183,
              value: "OEM",
            },
            {
              key: 3479,
              value: "OEM",
            },
            {
              key: 3224,
              value: "OLDSMOBILE",
            },
            {
              key: 3520,
              value: "OLDSMOBILE",
            },
            {
              key: 3444,
              value: "OMC FISHING BOAT GROUP, INC.",
            },
            {
              key: 3566,
              value: "ONYX MOTORCYCLES",
            },
            {
              key: 3242,
              value: "ORION BUS",
            },
            {
              key: 3538,
              value: "ORION BUS",
            },
            {
              key: 3408,
              value: "OSHKOSH",
            },
            {
              key: 3260,
              value: "PEGASUS",
            },
            {
              key: 3556,
              value: "PEGASUS",
            },
            {
              key: 3382,
              value: "PETERBILT",
            },
            {
              key: 3386,
              value: "PIERCE MANUFACTURING",
            },
            {
              key: 3391,
              value: "POLARIS",
            },
            {
              key: 3390,
              value: "PONTIAC",
            },
            {
              key: 3346,
              value: "PORSCHE",
            },
            {
              key: 3223,
              value: "PREVOST",
            },
            {
              key: 3519,
              value: "PREVOST",
            },
            {
              key: 3203,
              value: "QIPAI",
            },
            {
              key: 3499,
              value: "QIPAI",
            },
            {
              key: 3417,
              value: "RAM",
            },
            {
              key: 3239,
              value: "RAM-LIN",
            },
            {
              key: 3535,
              value: "RAM-LIN",
            },
            {
              key: 3447,
              value: "RAYCO",
            },
            {
              key: 3455,
              value: "ROAD RUNNER",
            },
            {
              key: 3228,
              value: "ROCKLAND COACH WORKS",
            },
            {
              key: 3524,
              value: "ROCKLAND COACH WORKS",
            },
            {
              key: 3368,
              value: "ROLLS ROYCE",
            },
            {
              key: 3255,
              value: "SANYOU",
            },
            {
              key: 3551,
              value: "SANYOU",
            },
            {
              key: 3459,
              value: "SCUDERIA CAMERON GLICKENHAUS (SCG)",
            },
            {
              key: 3419,
              value: "SHANGHAI JMSTAR MOTORCYCLE",
            },
            {
              key: 3449,
              value: "SHENQI",
            },
            {
              key: 3200,
              value: "SHINERAY",
            },
            {
              key: 3496,
              value: "SHINERAY",
            },
            {
              key: 3420,
              value: "SILVERLITE TRAILERS",
            },
            {
              key: 3241,
              value: "SKIPPER B",
            },
            {
              key: 3537,
              value: "SKIPPER B",
            },
            {
              key: 3432,
              value: "SMIT",
            },
            {
              key: 3244,
              value: "SMP",
            },
            {
              key: 3540,
              value: "SMP",
            },
            {
              key: 3243,
              value: "SNO-BIRD",
            },
            {
              key: 3539,
              value: "SNO-BIRD",
            },
            {
              key: 3465,
              value: "SOUTH WALTON GOLF CART RENTAL",
            },
            {
              key: 3250,
              value: "SPORTSMAN",
            },
            {
              key: 3546,
              value: "SPORTSMAN",
            },
            {
              key: 3267,
              value: "STARCRAFT",
            },
            {
              key: 3563,
              value: "STARCRAFT",
            },
            {
              key: 3184,
              value: "STERLING TRUCK",
            },
            {
              key: 3480,
              value: "STERLING TRUCK",
            },
            {
              key: 3411,
              value: "SUBARU",
            },
            {
              key: 3464,
              value: "SUNPULSE",
            },
            {
              key: 3213,
              value: "SUNTERA",
            },
            {
              key: 3509,
              value: "SUNTERA",
            },
            {
              key: 3404,
              value: "SUZUKI",
            },
            {
              key: 3202,
              value: "TAIZHOU CHUANL MOTORCYCLE MANUFACTURING",
            },
            {
              key: 3498,
              value: "TAIZHOU CHUANL MOTORCYCLE MANUFACTURING",
            },
            {
              key: 3245,
              value: "TEE NEE",
            },
            {
              key: 3541,
              value: "TEE NEE",
            },
            {
              key: 3470,
              value: "TEYIN",
            },
            {
              key: 3399,
              value: "THOMAS BUILT",
            },
            {
              key: 3253,
              value: "THOMSEN",
            },
            {
              key: 3549,
              value: "THOMSEN",
            },
            {
              key: 3457,
              value: "THULE TRAILERS, INC/C & C DISTRIBUTORS, INC.",
            },
            {
              key: 3214,
              value: "THUNDER MOUNTAIN CUSTOM CYCLES",
            },
            {
              key: 3510,
              value: "THUNDER MOUNTAIN CUSTOM CYCLES",
            },
            {
              key: 3229,
              value: "TMEC",
            },
            {
              key: 3525,
              value: "TMEC",
            },
            {
              key: 3217,
              value: "TOTAL E&S DBA TOTAL EQUIPMENT AND SERVICE",
            },
            {
              key: 3513,
              value: "TOTAL E&S DBA TOTAL EQUIPMENT AND SERVICE",
            },
            {
              key: 3369,
              value: "TOYOTA",
            },
            {
              key: 3468,
              value: "TRIDENT",
            },
            {
              key: 3434,
              value: "TRIPLE E INDUSTRIES",
            },
            {
              key: 3389,
              value: "TRIUMPH",
            },
            {
              key: 3409,
              value: "UD",
            },
            {
              key: 3492,
              value: "UKEYCHEYMA",
            },
            {
              key: 3187,
              value: "VANGUARD TRAILER, INC.",
            },
            {
              key: 3483,
              value: "VANGUARD TRAILER, INC.",
            },
            {
              key: 3398,
              value: "VICTORY",
            },
            {
              key: 3355,
              value: "VOLKSWAGEN",
            },
            {
              key: 3358,
              value: "VOLVO",
            },
            {
              key: 3359,
              value: "VOLVO TRUCK",
            },
            {
              key: 3210,
              value: "WABASH NATIONAL CORPORATION",
            },
            {
              key: 3506,
              value: "WABASH NATIONAL CORPORATION",
            },
            {
              key: 3446,
              value: "WALKER",
            },
            {
              key: 3450,
              value: "WANQIANG",
            },
            {
              key: 3454,
              value: "WESTERN",
            },
            {
              key: 3195,
              value: "WESTERN LIDO",
            },
            {
              key: 3491,
              value: "WESTERN LIDO",
            },
            {
              key: 3216,
              value: "WESTERN STAR",
            },
            {
              key: 3512,
              value: "WESTERN STAR",
            },
            {
              key: 3262,
              value: "WHITEGMC",
            },
            {
              key: 3558,
              value: "WHITEGMC",
            },
            {
              key: 3251,
              value: "WISDOM",
            },
            {
              key: 3547,
              value: "WISDOM",
            },
            {
              key: 3413,
              value: "WORKHORSE",
            },
            {
              key: 3227,
              value: "XIANFENG",
            },
            {
              key: 3523,
              value: "XIANFENG",
            },
            {
              key: 3207,
              value: "XINRI",
            },
            {
              key: 3503,
              value: "XINRI",
            },
            {
              key: 3181,
              value: "X-TEN",
            },
            {
              key: 3477,
              value: "X-TEN",
            },
            {
              key: 3388,
              value: "YAMAHA",
            },
            {
              key: 3264,
              value: "YIBEN",
            },
            {
              key: 3560,
              value: "YIBEN",
            },
            {
              key: 3215,
              value: "YONGFU",
            },
            {
              key: 3511,
              value: "YONGFU",
            },
            {
              key: 3189,
              value: "ZHEJIANG JIAJIA JUNENG MOTORCYCLE TECHNOLOGY CO., LTD.",
            },
            {
              key: 3485,
              value: "ZHEJIANG JIAJIA JUNENG MOTORCYCLE TECHNOLOGY CO., LTD.",
            },
            {
              key: 3218,
              value: "ZHEJIANG KANGDI VEHICLES CO",
            },
            {
              key: 3514,
              value: "ZHEJIANG KANGDI VEHICLES CO",
            },
            {
              key: 3460,
              value: "ZHEJIANG KINYE MOTOR VEHICLE CO., LTD.",
            },
            {
              key: 3448,
              value: "ZHWEKI",
            },
            {
              key: 3472,
              value: "ZONGSHEN INDUSTRIAL GROUP CO., LTD.",
            },
          ],
        },
        {
          propertyName: "Models",
          propertyType: "IEnumerable`1",
          propertySubType: "Int32",
          availableValues: [
            {
              key: 40012,
              value: "1 TON NOMINAL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40187,
              value: "1552-SC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40209,
              value: "1652-SC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40196,
              value: "1652-UPS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40215,
              value: "2554",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40217,
              value: "2574",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40221,
              value: "2654",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40231,
              value: "2674",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40011,
              value: "3/4 TON NOMINAL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40110,
              value: "3000HD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40224,
              value: "3400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40223,
              value: "3800",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40912,
              value: "4000 SERIES MEDIUM DUTY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40188,
              value: "4200 LP",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40192,
              value: "4300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40226,
              value: "4500/4700 LPX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40189,
              value: "4700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40227,
              value: "4700 LOW PROFILE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40230,
              value: "4800",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40228,
              value: "4900",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40137,
              value: "5000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40911,
              value: "5000 SERIES MEDIUM DUTY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40204,
              value: "5070",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 41001,
              value: "540",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41002,
              value: "542",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41003,
              value: "548CH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40184,
              value: "5600I",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 41054,
              value: "6000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40942,
              value: "6000 SERIES MEDIUM DUTY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40943,
              value: "7000 SERIES MEDIUM DUTY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40210,
              value: "8100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40200,
              value: "9100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40185,
              value: "9100I",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40190,
              value: "9200",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40186,
              value: "9200I",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40198,
              value: "9300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40191,
              value: "9400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40211,
              value: "9400I",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40193,
              value: "9600",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40197,
              value: "9700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40207,
              value: "9800",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40201,
              value: "9900",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40213,
              value: "9900I",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40212,
              value: "9900IX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40144,
              value: "9M003",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40313,
              value: "9M005",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40314,
              value: "9M006",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40315,
              value: "9M007",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40161,
              value: "9M008",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40768,
              value: "ACADIA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41065,
              value: "ACADIAN",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40715,
              value: "ADU",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40114,
              value: "AERIAL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40975,
              value: "AERIAL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40833,
              value: "AIRFLYTE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40057,
              value: "AIRPORT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40985,
              value: "AIRPORT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40723,
              value: "ALLURE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40776,
              value: "ALTA TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40101,
              value: "AMBULANCE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40953,
              value: "AMBULANCE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40789,
              value: "AMERI-PRO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40907,
              value: "AMIGO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40986,
              value: "ARROW XT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40129,
              value: "ARTICULATED",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40929,
              value: "ASCENDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40854,
              value: "ATIC CARGO MATE SNOW TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40788,
              value: "ATTC CARGO MATE SNOW TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40872,
              value: "ATTC CONTINENTAL SNOW TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40835,
              value: "AURORA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40834,
              value: "AVANT-GARDE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40746,
              value: "AVENGER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40781,
              value: "AVIATOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40932,
              value: "AXIOM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 41048,
              value: "AZTEK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40877,
              value: "AZTEX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40725,
              value: "BASE CAMP",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40765,
              value: "BLACK DIAMOND",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40832,
              value: "BLAST MULTI-PURPOSE HAULER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40855,
              value: "BLAZER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40737,
              value: "BLUE RIDGE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41081,
              value: "BONNEVILLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40978,
              value: "BOSS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40873,
              value: "BRAVE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40836,
              value: "BROOKSTONE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41026,
              value: "C5 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41009,
              value: "C500",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41020,
              value: "C540",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41004,
              value: "C550",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40846,
              value: "CAPRI",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40847,
              value: "CAPTIVA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40780,
              value: "CASCADE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40744,
              value: "CASCADES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40837,
              value: "CATALINA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41061,
              value: "CATALINA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40713,
              value: "CATALYST",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40979,
              value: "CELL CARAVAN",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40881,
              value: "CENTURY SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40582,
              value: "CG50B",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40880,
              value: "CHALLENGER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40842,
              value: "CHAPARRAL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40852,
              value: "CHAPARRAL LITE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41021,
              value: "CITILINER/CHARTOUR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 40017,
              value: "CLA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40966,
              value: "CLASSIC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40967,
              value: "CLASSIC ARTICULATED",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40845,
              value: "CLIPPER CAMPING TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40716,
              value: "CLIPPER TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40041,
              value: "CMA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40202,
              value: "CO-5870-OH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40194,
              value: "CO-9670",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40720,
              value: "COACHMEN",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40782,
              value: "COACHMEN ADRENALINE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40717,
              value: "COACHMEN APEX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40838,
              value: "COACHMEN PARK TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40203,
              value: "COF-5870-OH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40195,
              value: "COF-9670",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40739,
              value: "COLUMBUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40882,
              value: "COMFORT ISLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40053,
              value: "COMMERCIAL (HEMTT, HET, PLS, LVS) SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40045,
              value: "COMMERCIAL PHOENIX SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40843,
              value: "CONCORD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40058,
              value: "CONCRETE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40954,
              value: "CONCRETE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40738,
              value: "CONVINGTON COTTAGE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40726,
              value: "CORSICA TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40108,
              value: "CP",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40417,
              value: "CP250 MORPHOUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40839,
              value: "CROSS COUNTRY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40760,
              value: "CROSSBOW",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40844,
              value: "CRUISEMASTER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40749,
              value: "CRUSADER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40070,
              value: "CT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40996,
              value: "CUSTOM CONTENDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40692,
              value: "CW50 BW (CANADIAN MODEL)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40691,
              value: "CW50 ZUMA II",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40604,
              value: "CW50K/ZUMA II",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40605,
              value: "CW50L/ZUMA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40606,
              value: "CW50M/ZUMA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40607,
              value: "CW50N/ZUMA II",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40702,
              value: "CY50 RIVA JOG",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40048,
              value: "D.E. - REFUSE (DEISEL-ELECTRIC)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40181,
              value: "DA597",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40988,
              value: "DASH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40777,
              value: "DELLA TERRA TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40177,
              value: "DF557",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40174,
              value: "DF567",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40285,
              value: "DF577",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40178,
              value: "DF597",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40286,
              value: "DF677",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40162,
              value: "DF697",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40175,
              value: "DR557",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40173,
              value: "DR567",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40883,
              value: "DURACRAFT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40292,
              value: "DW577",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40284,
              value: "DW597",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40283,
              value: "DW697",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40176,
              value: "DX557",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40183,
              value: "DX567",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40795,
              value: "DYNA AIRE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40796,
              value: "DYNA AIRE FOUNDATION-MAX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40800,
              value: "DYNAMAX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40798,
              value: "DYNAQUEST ST",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40797,
              value: "DYNAQUEST XL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40799,
              value: "DYNAQUEST XV",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40179,
              value: "DZ567",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40287,
              value: "DZ577",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40180,
              value: "DZ597",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40142,
              value: "DZ677",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40182,
              value: "DZ697",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40262,
              value: "E-100 ALL ELECTRIC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40261,
              value: "E-GEN PLUG IN HYBRID",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40884,
              value: "ELKHART COACH/ELKC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40982,
              value: "EMBRACE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40850,
              value: "ENCORE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40848,
              value: "ENCOUNTER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40987,
              value: "ENFORCER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40973,
              value: "ENTERRA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40849,
              value: "EPIC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41019,
              value: "ER TRANSIT (ENGINE REAR)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41015,
              value: "ER TRANSIT CHASSIS ONLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 40069,
              value: "ES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40451,
              value: "EXPERIMENTAL VEHICLE UNDER DEVELOPMENT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40084,
              value: "F / M911 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40216,
              value: "F-2554",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40218,
              value: "F-2574",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40219,
              value: "F-2654",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40222,
              value: "F-2674",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40229,
              value: "F-4900",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40205,
              value: "F-5070",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40206,
              value: "F-5070-SF",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40946,
              value: "F6",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40947,
              value: "F7",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40214,
              value: "F-7100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40220,
              value: "F-8100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40199,
              value: "F-9300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40139,
              value: "FE20",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40887,
              value: "FEDERAL COACH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40083,
              value: "FF SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40145,
              value: "FF517",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40146,
              value: "FF527",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40148,
              value: "FF617",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40149,
              value: "FF627",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 41056,
              value: "FIERO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41049,
              value: "FIREBIRD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41052,
              value: "FIREFLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40974,
              value: "FIXED CAB",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40561,
              value: "FJ09",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40562,
              value: "FJ09C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40657,
              value: "FJR1300/FJR1300C/FJR13",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40466,
              value: "FJR1300A",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40343,
              value: "FJR1300A/FJR1300AC/FJR 1300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40444,
              value: "FJR1300AC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40467,
              value: "FJR1300AS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40344,
              value: "FJR1300AS/FJR1300ASC/FJR 1300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40445,
              value: "FJR1300ASC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40425,
              value: "FJR13A",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40424,
              value: "FJR13AC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40553,
              value: "FJR13ES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40555,
              value: "FJR13ESC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40423,
              value: "FJR13S",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40399,
              value: "FJR13SC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40767,
              value: "FLAGSTAFF LIGHT WEIGHT TRAILERS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40804,
              value: "FORCE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40727,
              value: "FOREST LODGE TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40886,
              value: "FOREST RIVER COMPANION",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40909,
              value: "FORWARD CONTROL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40910,
              value: "FORWARD CONTROL (FOR WALK-IN VAN)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40851,
              value: "FREEDOM EXPRESS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40841,
              value: "FREELANDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40046,
              value: "FRONT CONCRETE MACK (FCM)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40940,
              value: "FRR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40926,
              value: "FSR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40915,
              value: "FTR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40913,
              value: "FTR/FVR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40904,
              value: "FTR/FVR/EVR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40922,
              value: "FUN FINDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40769,
              value: "FURY TOYHAULER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40831,
              value: "FUTURA GRAND POINTE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40918,
              value: "FVR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40563,
              value: "FZ07",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40564,
              value: "FZ07C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40362,
              value: "FZ09",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40364,
              value: "FZ09C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40464,
              value: "FZ1-S",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40332,
              value: "FZ1-S/FZ1-SC/FZ-1",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40442,
              value: "FZ1-SC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40147,
              value: "FZ527",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40151,
              value: "FZ617",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40150,
              value: "FZ627",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40463,
              value: "FZ6R",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40441,
              value: "FZ6RC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40651,
              value: "FZ6-S/FZ6-SC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40621,
              value: "FZ6-S/FZ6-SC/FZ6",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40461,
              value: "FZ6-SHG",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40333,
              value: "FZ6-SHG/FZ6-SHGC/FZ6",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40439,
              value: "FZ6-SHGC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40514,
              value: "FZ8-N",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40515,
              value: "FZ8-NC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40479,
              value: "FZ8-S",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40588,
              value: "FZR1000B",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40688,
              value: "FZR600R C/FZR600",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40708,
              value: "FZR600R/FZR600",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40358,
              value: "FZS10",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40656,
              value: "FZS1000/FZS1000C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40359,
              value: "FZS10C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 41087,
              value: "G3",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41082,
              value: "G5",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41085,
              value: "G6",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41086,
              value: "G8",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40282,
              value: "GA107",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40307,
              value: "GF107",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40900,
              value: "GLAVAL EASY ON",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40888,
              value: "GLAVAL ENTOURAGE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40806,
              value: "GLAVAL LEGACY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40891,
              value: "GLAVAL SPORT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40892,
              value: "GLAVAL SYNERGY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40890,
              value: "GLAVAL TITAN 11 LP",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40303,
              value: "GR025",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40294,
              value: "GR035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 41057,
              value: "GRAND AM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40808,
              value: "GRAND HAVEN LITE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41060,
              value: "GRAND LEMANS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41084,
              value: "GRAND PRIX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40801,
              value: "GRAND SPORT GT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40802,
              value: "GRAND SPORT ULTRA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41091,
              value: "GTO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40308,
              value: "GW107",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40068,
              value: "GX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40309,
              value: "GZ107",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40086,
              value: "H SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40830,
              value: "HARBOR LITE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40740,
              value: "HARDSIDE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40786,
              value: "HAULIN-GO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41017,
              value: "HDX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41018,
              value: "HDX CHASSIS ONLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 40063,
              value: "HEAVY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40972,
              value: "HEAVY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40984,
              value: "HITCH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40936,
              value: "HOMBRE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40071,
              value: "HS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40093,
              value: "H-SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40945,
              value: "H-SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40956,
              value: "H-SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40050,
              value: "HULLED (APHA, BUSHMASTER) SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40935,
              value: "I-280",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40920,
              value: "I-290",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40919,
              value: "I-350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40921,
              value: "I-370",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40901,
              value: "IBEX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40937,
              value: "I-MARK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40989,
              value: "IMPEL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40763,
              value: "IMPRESSION",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40927,
              value: "IMPULSE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40778,
              value: "INDEPENDENCE TRAIL TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40783,
              value: "ISATA E SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40793,
              value: "ISATA F SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40082,
              value: "J SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 41062,
              value: "J2000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41028,
              value: "K 100E",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41032,
              value: "K100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41043,
              value: "K260/K360",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41031,
              value: "K270/K370",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41039,
              value: "K3 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41035,
              value: "K300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40254,
              value: "KL045",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40256,
              value: "KL055",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 41012,
              value: "KS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41011,
              value: "KT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41023,
              value: "KW45/KW55",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40291,
              value: "L3307",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40263,
              value: "L3337",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40290,
              value: "L3377",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40306,
              value: "L3407",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40316,
              value: "L3417",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40305,
              value: "L3427",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40288,
              value: "L3437",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40289,
              value: "L3447",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 41034,
              value: "L7 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41005,
              value: "L700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40264,
              value: "L9217",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40265,
              value: "L9227",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40266,
              value: "L9327",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40267,
              value: "L9357",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40238,
              value: "L9377",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40269,
              value: "L9427",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40279,
              value: "LA617",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40270,
              value: "LA627",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40273,
              value: "LA637",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40276,
              value: "LA647",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40277,
              value: "LA657",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40278,
              value: "LA667",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40159,
              value: "LA677",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40244,
              value: "LA687",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40237,
              value: "LA697",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40153,
              value: "LA707",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40154,
              value: "LA717",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40809,
              value: "LACROSSE TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40990,
              value: "LANCE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40923,
              value: "LAND ROAMER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40810,
              value: "LANDAU",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41067,
              value: "LAURENTIAN",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40090,
              value: "LB/BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40088,
              value: "LC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40065,
              value: "LC/RV",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40075,
              value: "LC500 / LC 500H",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40811,
              value: "LEGEND",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41053,
              value: "LEMANS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40812,
              value: "LEPRECHAUN",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40275,
              value: "LF517",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40271,
              value: "LF617",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40272,
              value: "LF627",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40274,
              value: "LF637",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40258,
              value: "LF647",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40268,
              value: "LF657",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40257,
              value: "LF667",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40140,
              value: "LF677",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40235,
              value: "LF687",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40236,
              value: "LF697",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40152,
              value: "LF707",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40155,
              value: "LF717",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40009,
              value: "LF72",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40073,
              value: "LFA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40452,
              value: "LFS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40969,
              value: "LFS ARTICULATED",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40061,
              value: "LIGHT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40960,
              value: "LIGHT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40052,
              value: "LIGHT (CLASS 5) SANDCAT SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40051,
              value: "LIGHT (CLASS 6) SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40895,
              value: "LIGHT HAULER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40897,
              value: "LIGHTINING",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40729,
              value: "LIMITED BASEMENT WIDE BODY CLASS C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40894,
              value: "LIMITED EDITION ECONO HAULER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40898,
              value: "LIMITED EDITION VALUE HAULER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40968,
              value: "LOW FLOOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40896,
              value: "LOW RIDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40080,
              value: "LS/LS HYBRID",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40113,
              value: "LT/COMMERCIAL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40158,
              value: "LT517",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40157,
              value: "LT707",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40172,
              value: "LT717",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40728,
              value: "LUMINA TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40076,
              value: "LX 570",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40319,
              value: "MA015",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40327,
              value: "MA025",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40317,
              value: "MA035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40322,
              value: "MA045",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40141,
              value: "MA055",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40304,
              value: "MA065",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 41071,
              value: "MATIZ",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40116,
              value: "MB/BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40091,
              value: "MC/RV",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40131,
              value: "MD/BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40062,
              value: "MEDIUM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40962,
              value: "MEDIUM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40044,
              value:
                "MEDIUM (CLASS 7) (NEW AND REMAN, MTVR, 5TTR, MTT, FMTV) SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40914,
              value: "MEDIUM FRONT ENGINE BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40924,
              value: "MEDIUM REAR ENGINE BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40321,
              value: "MF035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40318,
              value: "MH025",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40320,
              value: "MH035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40323,
              value: "MH045",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40324,
              value: "MH065",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40981,
              value: "MILESTONE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40135,
              value: "MILITARY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40077,
              value: "MILITARY (HEMTT, HET, PLS, LVS, FMTV) SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40813,
              value: "MIRADA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41073,
              value: "MODEL 3165",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41074,
              value: "MODEL 3405",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41075,
              value: "MODEL 3655",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41076,
              value: "MODEL 3895",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41047,
              value: "MODEL 3935",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41072,
              value: "MODEL 3945",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41077,
              value: "MODEL 3975",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41088,
              value: "MONTANA/ SV6",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40977,
              value: "MPG",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40325,
              value: "MR065",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40814,
              value: "M-SERIES LIGHTWEIGHT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40118,
              value: "MT/COMMERCIAL AFT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40117,
              value: "MT/COMMERCIAL FORWARD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40326,
              value: "MT035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40899,
              value: "MULTIPLE PURPOSE TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40047,
              value: "MUNICIPAL PATROL TRUCK (MPT TRUCK)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 41016,
              value: "MVP-EF (ENGINE FRONT)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41013,
              value: "MVP-ER (ENGINE REAR)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41014,
              value: "MVP-ER CHASSIS ONLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 40771,
              value: "NAVI TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40049,
              value: "NEW & REMAN MTT, 5TTR, M-ATV",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40311,
              value: "NF2AA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40156,
              value: "NF2AD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40143,
              value: "NFIAC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40889,
              value: "NITRO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40067,
              value: "NK SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40087,
              value: "NL SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40815,
              value: "NORTH RIDGE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40944,
              value: "NPR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40933,
              value: "NPR/ NPR-HD/ NPR-XD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40949,
              value: "NPR/NPR-HD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40916,
              value: "NPR-HD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40917,
              value: "NPR-XD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40941,
              value: "NQR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40928,
              value: "NQR/NRR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40908,
              value: "NRR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40312,
              value: "NW2AA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40074,
              value: "NX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40930,
              value: "OASIS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40747,
              value: "ODYSSEY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40792,
              value: "OPEN TEXAS UNIT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40056,
              value: "OSHKOSH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40064,
              value: "OSHKOSH CHASSIS - ENTRY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40096,
              value: "OSHKOSH CHASSIS - HIGH",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40136,
              value: "OSHKOSH CHASSIS - L",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40126,
              value: "OSHKOSH CHASSIS - M",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40095,
              value: "OSHKOSH CHASSIS - MID",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40127,
              value: "OSHKOSH CHASSIS - V",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40054,
              value: "OSHKOSH SPECIALTY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40055,
              value: "OSHKOSH TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 41036,
              value: "OTHER OFF-HIGHWAY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40867,
              value: "OUTLAW",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40774,
              value: "OZARK TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40853,
              value: "OZARK TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40085,
              value: "P SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40014,
              value: "P32",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40013,
              value: "P42",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 41055,
              value: "PARISIENNE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40816,
              value: "PATHFINDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40031,
              value: "PB105",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40032,
              value: "PB205",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40029,
              value: "PB215",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40033,
              value: "PB305",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40021,
              value: "PB405",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40039,
              value: "PB905",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40040,
              value: "PC015",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40035,
              value: "PC025",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40028,
              value: "PC035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40026,
              value: "PC045",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40027,
              value: "PC055",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40037,
              value: "PC065",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40038,
              value: "PC075",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40001,
              value: "PC085",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40020,
              value: "PC205",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40018,
              value: "PC215",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40034,
              value: "PC305",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40022,
              value: "PC405",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40023,
              value: "PC505",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40002,
              value: "PC515",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40024,
              value: "PC605",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40005,
              value: "PC615",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40036,
              value: "PC625",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40025,
              value: "PC705",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40019,
              value: "PC805",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40000,
              value: "PC815",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 41059,
              value: "PHOENIX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40931,
              value: "PICKUP",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40952,
              value: "PIERCE MFG",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40730,
              value: "PREMIER CAMPING TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40818,
              value: "PRISM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40772,
              value: "PTX TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40766,
              value: "PUMA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40115,
              value: "PUMPER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40994,
              value: "PUMPER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40828,
              value: "PURSUIT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41090,
              value: "PURSUIT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40372,
              value: "PW50",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40660,
              value: "PW80",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40992,
              value: "QUANTUM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40902,
              value: "R POD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40762,
              value: "R POD TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40138,
              value: "R20",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40259,
              value: "R26",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40250,
              value: "RA017",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40252,
              value: "RA027",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40951,
              value: "RADIANCE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40724,
              value: "RAINIER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40857,
              value: "RAMBLER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40856,
              value: "RANGER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40072,
              value: "RC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40078,
              value: "RC F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40280,
              value: "RE21",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40030,
              value: "RE300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3412,
              },
            },
            {
              key: 40225,
              value: "RE3000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40748,
              value: "REAL-LITE TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40128,
              value: "REAR MOUNTED ENGINE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40094,
              value: "RECOVERY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40959,
              value: "RECOVERY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40761,
              value: "REDLINE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40731,
              value: "REFRIGERATED CARGO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40092,
              value: "REFUSE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40955,
              value: "REFUSE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40865,
              value: "RENEGADE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40125,
              value: "RESCUE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40995,
              value: "RESCUE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40251,
              value: "RF017",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40253,
              value: "RF027",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40722,
              value: "RIVERSTONE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40764,
              value: "ROCKWOOD LIGHT WEIGHT TRAILERS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40721,
              value: "ROCKWOOD LITE WEIGHT TRAILERS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41045,
              value: "RODEO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40934,
              value: "RODEO/AMIGO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40775,
              value: "ROGUE TRUCK CAMPER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40858,
              value: "ROUGH RIDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40329,
              value: "RPOD TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40859,
              value: "RS SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40665,
              value: "RT100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40672,
              value: "RT180",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40965,
              value: "RTS LOW FLOOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40964,
              value: "RTS NARROW FRONT DOOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40963,
              value: "RTS WIDE FRONT DOOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40081,
              value: "S SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 41037,
              value: "S10/A3",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41007,
              value: "S106R4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40248,
              value: "SA025",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40247,
              value: "SA035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40299,
              value: "SA515",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40302,
              value: "SA525",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40164,
              value: "SA537",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40171,
              value: "SA547",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40298,
              value: "SA557",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40240,
              value: "SA567",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40160,
              value: "SA615",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40301,
              value: "SA625",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40163,
              value: "SA637",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40296,
              value: "SA647",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40239,
              value: "SA667",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40991,
              value: "SABER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 41063,
              value: "SAFARI",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41046,
              value: "SAF-T-LINER ER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 41069,
              value: "SAF-T-LINER MVP",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 40785,
              value: "SALEM LITE TRAILERS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40757,
              value: "SANDPIPER LTD TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40745,
              value: "SANDPIPER/SIERRA HARDWALL TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40756,
              value: "SANIBEL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40133,
              value: "SB/BUS RD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40120,
              value: "SB/BUS STYLE C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40123,
              value: "SB/BUS STYLE D",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 41078,
              value: "SCHOOL BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 40249,
              value: "SF035",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40232,
              value: "SF525",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40167,
              value: "SF537",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40169,
              value: "SF547",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40295,
              value: "SF557",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40241,
              value: "SF567",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40233,
              value: "SF625",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40166,
              value: "SF637",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40170,
              value: "SF647",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40297,
              value: "SF657",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40242,
              value: "SF667",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40703,
              value: "SH50 RIVA RAZZ",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40704,
              value: "SH50M RIVA RAZZ",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40950,
              value: "SHADOW CRUISER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40779,
              value: "SHASTA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40750,
              value: "SHASTA AIRFLYTE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40803,
              value: "SHASTA CYNARA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40718,
              value: "SHASTA FLYTE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40751,
              value: "SHASTA FREEPORT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40755,
              value: "SHASTA OASIS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40754,
              value: "SHASTA PHOENIX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40752,
              value: "SHASTA REVERE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40821,
              value: "SHASTA STD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40791,
              value: "SHIPSE TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40773,
              value: "SILVER LAKE TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40742,
              value: "SOFTSIDE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40794,
              value: "SOLAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40787,
              value: "SOLARA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41092,
              value: "SOLSTICE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40980,
              value: "SOUTHFORK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40735,
              value: "SPARTAN TOY HAULER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40874,
              value: "SPECIAL ECONOMY HAULER CM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40860,
              value: "SPECIAL VALUE HAULER CC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40134,
              value: "SPECIALITY VEHICLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40770,
              value: "SPIRIT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40819,
              value: "SPIRIT OF AMERICA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40753,
              value: "SPIRIT OF AMERICA LIBERTY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40820,
              value: "SPORTSCOACH ELITE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40543,
              value: "SR400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40542,
              value: "SR400C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40300,
              value: "SR515",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40234,
              value: "SR525",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40165,
              value: "SR537",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40255,
              value: "SR667",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40807,
              value: "SS SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40121,
              value: "ST/ COMMERCIAL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40861,
              value: "STARCRAFT ALL STAR XL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40862,
              value: "STARCRAFT BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40871,
              value: "STARCRAFT EXPRESS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40805,
              value: "STARCRAFT GAURDIAN SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40875,
              value: "STARCRAFT MFSAB/PRODIGY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40878,
              value: "STARCRAFT MFSAB/RONDAK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40885,
              value: "STARCRAFT QUEST",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40790,
              value: "STARCRAFT SCHOOL BUS/QUEST",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40870,
              value: "STARCRAFT XLT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40741,
              value: "STEALTH EVO TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40328,
              value: "STEALTH TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40976,
              value: "STRYKER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40905,
              value: "STYLUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 41050,
              value: "SUNBIRD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41068,
              value: "SUNBIRD 2000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41066,
              value: "SUNBURST",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41070,
              value: "SUNFIRE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40758,
              value: "SUNRISE TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40879,
              value: "SUNSHINE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40330,
              value: "SURGE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40822,
              value: "SWIFT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40208,
              value: "SX525",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40168,
              value: "SX537",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40293,
              value: "SX567",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40246,
              value: "SX667",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40245,
              value: "SZ507",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40243,
              value: "SZ607",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40066,
              value: "T / P-19 / STRIKER SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 41058,
              value: "T1000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 41038,
              value: "T2 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41008,
              value: "T2000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41030,
              value: "T3 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41044,
              value: "T300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41025,
              value: "T4 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41022,
              value: "T400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41006,
              value: "T450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41024,
              value: "T6 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41033,
              value: "T600",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40710,
              value: "T602",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40519,
              value: "T606",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 41041,
              value: "T680",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40938,
              value: "T6F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 41029,
              value: "T7 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40711,
              value: "T702",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40712,
              value: "T706",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40948,
              value: "T7F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 41027,
              value: "T8 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40450,
              value: "T8.502",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 41000,
              value: "T800",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40971,
              value: "T802",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 40970,
              value: "T806",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3387,
              },
            },
            {
              key: 41042,
              value: "T880",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40939,
              value: "T8F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40281,
              value: "TA005",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40866,
              value: "TAILWIND",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40903,
              value: "TANDARA TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41079,
              value: "TBB",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3399,
              },
            },
            {
              key: 40132,
              value: "TC/RV",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 41064,
              value: "TEMPEST",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40961,
              value: "TILT CAB",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 41089,
              value: "TORRENT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40893,
              value: "TOW-N-STOW",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40310,
              value: "TR005",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3414,
              },
            },
            {
              key: 40823,
              value: "TRACER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40059,
              value: "TRACTOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40957,
              value: "TRACTOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 41051,
              value: "TRANS SPORT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40863,
              value: "TRAVEL COMPANION",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40864,
              value: "TRAVEL MATE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40734,
              value: "TRILOGY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40733,
              value: "TRILOGY SLC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40732,
              value: "TRILOGY TOURING EDITON",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40999,
              value: "TROOPER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40906,
              value: "TROOPER II",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40060,
              value: "TRUCK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40958,
              value: "TRUCK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40371,
              value: "TT-R110E",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40377,
              value: "TT-R125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40650,
              value: "TT-R125/TT-R125LW/TTR125L",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40402,
              value: "TT-R125E (ELECTRIC START)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40370,
              value: "TT-R125LE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40404,
              value: "TT-R125LW (ELECTRIC START)/TT-R125LE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40589,
              value: "TTR125LWE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40403,
              value: "TT-R125W/TT-R125LE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40623,
              value: "TT-R225/TT-R225C/TTR225L",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40369,
              value: "TTR230",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40405,
              value: "TT-R230",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40661,
              value: "TT-R250/TT-R250C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40376,
              value: "TT-R50E",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40640,
              value: "TTR90",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40646,
              value: "TT-R90E",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40522,
              value: "TW200",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40497,
              value: "TW200 (E)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40507,
              value: "TW200 (E)C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40658,
              value: "TW200/TW200C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40584,
              value: "TW200B",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40585,
              value: "TW200BC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40983,
              value: "TWILIGHT/TWILIGHT SIGNATURE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40701,
              value: "TZ125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40690,
              value: "TZ250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40124,
              value: "UB/BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40043,
              value: "UD1100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40105,
              value: "UD1200",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40097,
              value: "UD1300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40098,
              value: "UD1400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40106,
              value: "UD1800",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40099,
              value: "UD1800 CS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40100,
              value: "UD1800 HD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40102,
              value: "UD2000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40112,
              value: "UD2300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40103,
              value: "UD2600",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40109,
              value: "UD2800",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40107,
              value: "UD3000",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40104,
              value: "UD3300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40042,
              value: "UD550T",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40111,
              value: "UD600T",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3409,
              },
            },
            {
              key: 40876,
              value: "US CARGO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40079,
              value: "UX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3407,
              },
            },
            {
              key: 40122,
              value: "VB/BUS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40130,
              value: "VC/RV",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40998,
              value: "VEHICROSS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3384,
              },
            },
            {
              key: 40993,
              value: "VELOCITY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3386,
              },
            },
            {
              key: 40736,
              value: "VENGEANCE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40714,
              value: "VIBE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 41080,
              value: "VIBE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40925,
              value: "VIEW FINDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3385,
              },
            },
            {
              key: 40826,
              value: "VIKING APEX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40827,
              value: "VIKING CAMPING TRAILER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40840,
              value: "VIKING CANADIAN LEISURE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40817,
              value: "VIKING GRAND HAVEN",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40719,
              value: "VIKING TOWABLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40868,
              value: "V-LOW",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40697,
              value: "VMX12 C V-MAX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40696,
              value: "VMX12 V-MAX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40645,
              value: "VMX12 V-MAX/VMX12C V-MAX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40997,
              value: "VMX12B",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40449,
              value: "VMX17",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40334,
              value: "VMX17/VMX17C/V-MAX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40501,
              value: "VMX17C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40829,
              value: "V-TREC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40007,
              value: "W18",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40010,
              value: "W22",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40006,
              value: "W24",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40016,
              value: "W42",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40015,
              value: "W52",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40008,
              value: "W62",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40089,
              value: "W82",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 41040,
              value: "W9 SERIES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 41010,
              value: "W900",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3400,
              },
            },
            {
              key: 40004,
              value: "WA002",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40003,
              value: "WA005",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 40260,
              value: "WA012",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3413,
              },
            },
            {
              key: 41083,
              value: "WAVE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3390,
              },
            },
            {
              key: 40759,
              value: "WEE GO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40410,
              value: "WF450F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40784,
              value: "WILDWOOD HARDWALL TOWABLES",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40869,
              value: "WORK N TOW",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40510,
              value: "WR250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40511,
              value: "WR250C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40406,
              value: "WR250F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40496,
              value: "WR250R",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40407,
              value: "WR250R/WR250RC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40483,
              value: "WR250RC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40474,
              value: "WR250X",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40408,
              value: "WR250X/WR250XC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40475,
              value: "WR250XC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40546,
              value: "WR250Z",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40367,
              value: "WR25R",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40368,
              value: "WR25RC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40666,
              value: "WR400F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40664,
              value: "WR426F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40366,
              value: "WR450F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40824,
              value: "WYOMING",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40825,
              value: "WYOMING SUMMIT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40119,
              value: "XC/RV",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3408,
              },
            },
            {
              key: 40705,
              value: "XC125 RIVA 125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40416,
              value: "XC125 VINO 125 / YJ125 (CANADA)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40525,
              value: "XC155",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40622,
              value: "XC1700A/AC/AS/ASC/AT/ARC/ROAD STAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40583,
              value: "XC200B",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40523,
              value: "XC50",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40455,
              value: "XC50 VINO CLASSIC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40458,
              value: "XF50 C3",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40682,
              value: "XJ600S SECA II/XJ600C SECA II",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40743,
              value: "XLR TOY HAULER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3401,
              },
            },
            {
              key: 40544,
              value: "XP500",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40453,
              value: "XP500 TMAX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40529,
              value: "XSR900",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40530,
              value: "XSR900C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40476,
              value: "XT1200Z",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40477,
              value: "XT1200ZC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40659,
              value: "XT225/XT225C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40518,
              value: "XT250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40409,
              value: "XT250/XT250C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40509,
              value: "XT250C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40674,
              value: "XT350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40586,
              value: "XT600EB",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40587,
              value: "XT600EBC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40354,
              value: "XTZ12",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40355,
              value: "XTZ12C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40356,
              value: "XTZ12E",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40357,
              value: "XTZ12EC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40545,
              value: "XV1100 C VIRAGO 1100 SPL/XV1100S C VIRAGO 1100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40590,
              value: "XV1100 VIRAGO 1100/XV1100S VIRAGO SPL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40698,
              value: "XV1100S VIRAGO 1100 SPL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40699,
              value: "XV13A ROYAL STAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40709,
              value: "XV13LT ROYAL STAR TOUR DELUXE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40633,
              value: "XV1600A/AC/AS/ASC ROAD STAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40634,
              value: "XV1600AT/ATC ROAD STAR CLASSIC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40602,
              value: "XV1700A/AS/AT/ATS/AC/ASC/ATC/ATSC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40347,
              value: "XV1700A/AS/AT/ATS/AC/ASC/ATC/ATSC/ROAD STAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40459,
              value: "XV1700A/AT/ATS/AS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40473,
              value: "XV1700ATSC/ATC/ASC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40429,
              value: "XV1700PC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40635,
              value: "XV1700PC/PCC/SPC/SPCC ROAD STAR WARRIOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40686,
              value: "XV1700PC/XV1000PCC ROAD WARRIOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40348,
              value: "XV1700PC/XV1700PCC/WARRIOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40446,
              value: "XV1700PCC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40353,
              value: "XV17AS/ATS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40352,
              value: "XV17ASC/ATSC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40427,
              value: "XV1900A",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40349,
              value: "XV1900A/AC/ROADLINER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40438,
              value: "XV1900AC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40428,
              value: "XV1900CT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40363,
              value: "XV1900CT/CTC/STRATOLINER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40437,
              value: "XV1900CTC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40448,
              value: "XV1900CU",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40375,
              value: "XV1900CU/XV1900CUC/RAIDER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40500,
              value: "XV1900CUC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40547,
              value: "XV19C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40486,
              value: "XV19C/CS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40548,
              value: "XV19CC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40487,
              value: "XV19CC/CSC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40482,
              value: "XV19CS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40484,
              value: "XV19CSC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40480,
              value: "XV19CTF/CTS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40481,
              value: "XV19CTFC/CTSC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40494,
              value: "XV19SCL",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40485,
              value: "XV19SCLC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40468,
              value: "XV250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40655,
              value: "XV250 C VIRAGO 250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40654,
              value: "XV250 VIRAGO 250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40643,
              value: "XV250 VIRAGO 250 / XV250C VIRAGO 251",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40340,
              value: "XV250/XV250C/V STAR 250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40502,
              value: "XV250C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40695,
              value: "XV535 VIRAGO 535",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40615,
              value: "XV750 C VIRAGO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40616,
              value: "XV750 VIRAGO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40663,
              value: "XVS1100/A/AC/C/V-STAR 1100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40342,
              value: "XVS1100/A/C/AC/AT/ATC/V STAR 1100",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40431,
              value: "XVS1100AT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40434,
              value: "XVS1100ATC/C/AC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40435,
              value: "XVS1300A",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40345,
              value: "XVS1300A/XVS1300AC/V STAR 1300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40499,
              value: "XVS1300AC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40426,
              value: "XVS1300CT/XVS1300CT-B",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40346,
              value: "XVS1300CT/XVS1300CTC/V STAR 1300",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40498,
              value: "XVS1300CTC/XVS1300CT-BC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40512,
              value: "XVS1300CU",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40513,
              value: "XVS1300CUC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40488,
              value: "XVS13A",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40489,
              value: "XVS13AC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40551,
              value: "XVS13C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40552,
              value: "XVS13CC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40492,
              value: "XVS13CE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40493,
              value: "XVS13CEC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40490,
              value: "XVS13CT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40550,
              value: "XVS13CT/XVS13CTF/XVS13BG",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40491,
              value: "XVS13CTC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40549,
              value: "XVS13CTC/XVS13CTFC/XVS13BGC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40374,
              value: "XVS65",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40503,
              value: "XVS650",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40341,
              value: "XVS650/A/C/AC/AT/ATC/V STAR 650",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40638,
              value: "XVS650/A/C/AC/V-STAR CLASSIC/CUSTOM",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40469,
              value: "XVS650A/AT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40447,
              value: "XVS650AC/ATC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40504,
              value: "XVS650C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40365,
              value: "XVS65C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40557,
              value: "XVS95/XVS95CT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40351,
              value: "XVS950/XVS950CT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40432,
              value: "XVS950A/CT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40433,
              value: "XVS950AC/CTC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40350,
              value: "XVS950C/CTC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40516,
              value: "XVS950CT",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40517,
              value: "XVS950CTC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40360,
              value: "XVS95C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40558,
              value: "XVS95C/XVS95CTC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40361,
              value: "XVS95CC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40559,
              value: "XVS95CR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40560,
              value: "XVS95CRC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40505,
              value: "XVZ13",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40687,
              value: "XVZ13AT ROYAL STAR TOUR CLASSIC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40430,
              value: "XVZ13CT/CTS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40436,
              value: "XVZ13CTC/CTSC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40335,
              value: "XVZ13CTS/XVZ13CTSC/ROYAL STAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40336,
              value: "XVZ13TF/XVZ13TFC/XVZ13TFS/XVZ13TFSC/ROYAL STAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40506,
              value: "XVZ13TFS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40472,
              value: "XVZ13TFS/TF",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40508,
              value: "XVZ13TFSC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40495,
              value: "XVZ13TFSC/FC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40331,
              value: "YAMAHA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40580,
              value: "YAMAHA UTILITY VEHICLE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40669,
              value: "YFA-1 BREEZE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40624,
              value: "YFA-1 BREEZE/YFA-1C BREEZE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40668,
              value: "YFA-1C BREEZE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40706,
              value: "YFB250FW TIMBERWOLF 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40680,
              value: "YFH250U TIMBERWOLF",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40401,
              value: "YFM125A/GRIZZLY 125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40531,
              value: "YFM125R RAPTOR 125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40400,
              value: "YFM250 BIG BEAR 250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40411,
              value: "YFM250R RAPTOR 250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40387,
              value: "YFM350 GRIZZLY 350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40378,
              value: "YFM350A GIZZLY 250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40594,
              value: "YFM350A/GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40379,
              value: "YFM350AS WOLVERINE 350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40681,
              value: "YFM350ER/YFM350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40685,
              value: "YFM350FW BIG BEAR 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40380,
              value: "YFM350FWA 4WD GIZZLY 350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40381,
              value: "YFM350FWA 4WD HUNTING SP AP HD GIZZLY 350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40653,
              value: "YFM350FWA BRUIN 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40595,
              value: "YFM350FWA/GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40382,
              value: "YFM350FWAN 4WD GIZZLY 350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40383,
              value: "YFM350FWAN 4WD HUNTING SP AP HD GRIZZLY 350",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40677,
              value: "YFM350FWB BIG BEAR 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40676,
              value: "YFM350FWB C BIG BEAR 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40673,
              value: "YFM350FW-X C WOLVERINE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40617,
              value: "YFM350FW-X WOLVERINE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40625,
              value: "YFM350X WARRIOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40627,
              value: "YFM350XC WARRIOR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40636,
              value: "YFM400A KODIAK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40637,
              value: "YFM400AN KODIAK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40678,
              value: "YFM400FW KODIAK 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40694,
              value: "YFM400FWA KODIAK 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40384,
              value: "YFM400FWAN 4WD BIG BEAR 400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40385,
              value: "YFM400FWAN 4WD HUNTING SP BIG BEAR 400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40632,
              value: "YFM400FWAN KODIAK 400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40629,
              value: "YFM400FWAN KODIAK 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40679,
              value: "YFM400FWB KODIAK 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40386,
              value: "YFM400FWN 4WD BIG BEAR 400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40388,
              value: "YFM400FWN 4WD HUNTING SP AP HD BIG BEAR 400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40619,
              value: "YFM400FWN BIG BEAR FWD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40647,
              value: "YFM400FWN HUNTING SP HW HD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40628,
              value: "YFM400N BIG BEAR 2WD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40389,
              value: "YFM450FAS 4WD SPECIAL EDITION WOLVERINE 450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40398,
              value: "YFM450FAS 4WD WOLVERINE 450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40532,
              value: "YFM450FWA GIZZLY 450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40535,
              value: "YFM450FWA HUNTING",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40596,
              value: "YFM450FWA/GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40533,
              value: "YFM450FWAD HUNTING GIZZLY 450 ESP",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40536,
              value: "YFM450FWAD SP CANADA LE GIZZLY 450 EPS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40534,
              value: "YFM450FWAD SP GIZZLY 450 EPS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40390,
              value: "YFM450FWAN GIZZLY 450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40391,
              value: "YFM450FWAN HUNTING SP AP HD GIZZLY 450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40630,
              value: "YFM450FWAN KODIAK 450 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40631,
              value: "YFM450FWAN KODIAK 4X4",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40392,
              value: "YFM450FWAN SPECIAL EDITION GIZZLY 450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40418,
              value: "YFM50 RAPTOR 50",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40397,
              value: "YFM500FWAD GRIZZLY 550",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40396,
              value: "YFM550FWA GIZZLY 550",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40539,
              value: "YFM550FWAD CANADA LE GIZZLY 550",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40537,
              value: "YFM550FWAD HUNTING GIZZLY 550",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40538,
              value: "YFM550FWAD SP GIZZLY 550",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40598,
              value: "YFM550FWAD/GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40597,
              value: "YFM550WA/GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40707,
              value: "YFM600FWA GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40471,
              value: "YFM660FWA GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40620,
              value: "YFM660R RAPTOR 2WD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40601,
              value: "YFM700DFG/GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40520,
              value: "YFM700FWA GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40540,
              value: "YFM700FWA HUNTING",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40572,
              value: "YFM700FWA HUNTING/ GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40571,
              value: "YFM700FWA/ GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40599,
              value: "YFM700FWA/GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40567,
              value: "YFM700FWAD AL CAST GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40568,
              value: "YFM700FWAD CANADA SE GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40662,
              value: "YFM700FWAD GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40554,
              value: "YFM700FWAD HUNTING GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40570,
              value: "YFM700FWAD HUNTING SP XTRA EPS / GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40566,
              value: "YFM700FWAD SE GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40578,
              value: "YFM700FWAD/ GRIZZLY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40574,
              value: "YFM700FWB HUNTING SP XTRA/ KODIAK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40573,
              value: "YFM700FWB/ KODIAK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40591,
              value: "YFM700FWBD EPS / KODIAK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40569,
              value: "YFM700FWBD HUNTING SP XTRA EPS / KODIAK",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40603,
              value: "YFM700PF/GRIZZLY 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40521,
              value: "YFM700R RAPTOR 700",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40671,
              value: "YFM80 BADGER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40419,
              value: "YFM80 G GRIZZLY 80",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40693,
              value: "YFM80/YFM80C BADGER / YFM80C BADGER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40670,
              value: "YFM80C BADGER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40420,
              value: "YFM80R RAPTOR 80",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40626,
              value: "YFM80W RAPTOR 80",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40421,
              value: "YFM90R RAPTOR 90",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40652,
              value: "YFS200 BLASTER",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40608,
              value: "YFX700F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40609,
              value: "YFX700F HUNTING SP AP HD",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40612,
              value: "YFX700F HUNTING SP AP HD DU",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40610,
              value: "YFX700F SPECIAL EDITION",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40611,
              value: "YFX700FYFX700F SPECIAL EDITION SPORTS",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40618,
              value: "YFZ350 BANSHEE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40393,
              value: "YFZ450",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40394,
              value: "YFZ450R",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40593,
              value: "YFZ450R/YFZ450R SE",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40395,
              value: "YFZ450X",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40526,
              value: "YFZR3",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40460,
              value: "YJ125 (CANADA) VINO 125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40639,
              value: "YJ50R VINO",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40675,
              value: "YM350UB BIG BEAR",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40541,
              value: "YP400",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40454,
              value: "YP400 MAJESTY",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40581,
              value: "YSR50B",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40524,
              value: "YW125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40457,
              value: "YW125 ZUMA 125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40456,
              value: "YW50 ZUMA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40592,
              value: "YW50/ZUMA",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40478,
              value: "YW50F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40373,
              value: "YW50FX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40575,
              value: "YXC700 (VIKING VI)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40576,
              value: "YXE700 (WOLVERINE)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40600,
              value: "YXM700 (VIKING)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40641,
              value: "YXR450F (RHINO 450)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40648,
              value: "YXR660F (RHINO 660)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40642,
              value: "YXR700F (RHINO 700)",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40422,
              value: "YZ125",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40413,
              value: "YZ250",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40414,
              value: "YZ250F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40613,
              value: "YZ250FX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40577,
              value: "YZ250X",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40667,
              value: "YZ400F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40689,
              value: "YZ426F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40415,
              value: "YZ450F",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40579,
              value: "YZ450FX",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40700,
              value: "YZ80",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40412,
              value: "YZ85",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40684,
              value: "YZF600R C/ YZF600R",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40683,
              value: "YZF600R/YZF6006",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40644,
              value: "YZF600R/YZF600RC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40614,
              value: "YZF750R/YZF750R C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40465,
              value: "YZF-R1",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40337,
              value: "YZF-R1/YZF-R1C/YZF-R1",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40649,
              value: "YZF-R1/YZF-R1C/YZF-R1S/YZF-R1SC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40443,
              value: "YZF-R1C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40565,
              value: "YZFR1M",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40556,
              value: "YZFR1MC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40527,
              value: "YZFR1S",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40528,
              value: "YZFR1SC",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40462,
              value: "YZF-R6",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40338,
              value: "YZF-R6/YZF-R6C/R6",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40440,
              value: "YZF-R6C",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40470,
              value: "YZF-R6S",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
            {
              key: 40339,
              value: "YZF-R6S/YZF-R6SC/YZF-R6S",
              dependsOn: {
                propertyName: "Makes",
                propertyValue: 3388,
              },
            },
          ],
        },
        {
          propertyName: "MileageFrom",
          propertyType: "Nullable`1",
          propertySubType: "Int32",
          rules: [
            {
              type: "Number",
            },
            {
              valueFrom: 0,
              valueTo: 100000,
              type: "Range",
            },
          ],
        },
        {
          propertyName: "MileageTo",
          propertyType: "Nullable`1",
          propertySubType: "Int32",
          rules: [
            {
              valueFrom: 0,
              valueTo: 100000,
              type: "Range",
            },
          ],
        },
        {
          propertyName: "Series",
          propertyType: "String",
        },
        {
          propertyName: "AutoTypes",
          propertyType: "IEnumerable`1",
          propertySubType: "AutoType",
          availableValues: [
            "Sedan",
            "Coupe",
            "Hatchback",
            "Wagon",
            "Convertible",
            "Roadster",
            "SUV",
            "CUV",
            "Van",
            "Truck",
            "Bus",
            "Motorcycle",
          ],
        },
        {
          propertyName: "TransmissionTypes",
          propertyType: "IEnumerable`1",
          propertySubType: "TransmissionType",
          availableValues: ["Automatic", "Manual", "CVT", "AMT", "DCT"],
        },
        {
          propertyName: "TitleStatuses",
          propertyType: "IEnumerable`1",
          propertySubType: "TitleStatus",
          availableValues: [
            "Clean",
            "Salvage",
            "Rebuilt",
            "Parts",
            "Lien",
            "None",
          ],
        },
        {
          propertyName: "Color",
          propertyType: "String",
        },
        {
          propertyName: "FuelTypes",
          propertyType: "IEnumerable`1",
          propertySubType: "FuelType",
          availableValues: [
            "Gasoline",
            "Diesel",
            "Electric",
            "Hybrid",
            "Hydrogen",
            "NaturalGas",
          ],
        },
        {
          propertyName: "DriveTypes",
          propertyType: "IEnumerable`1",
          propertySubType: "DriveType",
          availableValues: ["Front", "Rear", "All", "Four"],
        },
        {
          propertyName: "YearFrom",
          propertyType: "Nullable`1",
          propertySubType: "Int32",
          rules: [
            {
              valueFrom: 1900,
              valueTo: 3000,
              type: "Range",
            },
          ],
        },
        {
          propertyName: "YearTo",
          propertyType: "Nullable`1",
          propertySubType: "Int32",
          rules: [
            {
              valueFrom: 1900,
              valueTo: 3000,
              type: "Range",
            },
          ],
        },
        {
          propertyName: "Trim",
          propertyType: "String",
        },
        {
          propertyName: "CylinderCount",
          propertyType: "IEnumerable`1",
          propertySubType: "Int32",
          availableValues: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12],
          rules: [
            {
              valueFrom: 0,
              valueTo: 12,
              type: "Range",
            },
          ],
        },
        {
          propertyName: "AutoConditions",
          propertyType: "IEnumerable`1",
          propertySubType: "AutoCondition",
          availableValues: [
            "New",
            "LikeNew",
            "Excellent",
            "Good",
            "Fair",
            "Salvage",
          ],
        },
        {
          propertyName: "ModifiedDateFrom",
          propertyType: "Nullable`1",
          propertySubType: "DateTime",
        },
        {
          propertyName: "ModifiedDateTo",
          propertyType: "Nullable`1",
          propertySubType: "DateTime",
        },
        {
          propertyName: "CreatedDateFrom",
          propertyType: "Nullable`1",
          propertySubType: "DateTime",
        },
        {
          propertyName: "CreatedDateTo",
          propertyType: "Nullable`1",
          propertySubType: "DateTime",
        },
      ],
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