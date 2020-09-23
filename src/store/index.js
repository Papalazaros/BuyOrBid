import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    loading: false,
  },
  getters: {
    isLoading(state) {
      return state.loading;
    }
  },
  mutations: {
    SET_PROPERTY(state, {
      property,
      key,
      value
    }) {
      Vue.set(property ? state[property] : state, key, value);
    }
  },
  actions: {
    setLoading({
      commit
    }, isLoading) {
      commit("SET_PROPERTY", {
        key: "loading",
        value: isLoading
      });
    },
  },
  modules: {}
});