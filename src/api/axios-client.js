import router from "../router";
import store from "../store";
const axios = require("axios");

const instance = axios.create({
    baseURL: 'https://localhost:44309/',
});

instance.interceptors.response.use(function (response) {
    store.dispatch("setLoading", false);
    return response;
}, function (error) {
    console.log(error);

    if ((!error.response || error.response.status === 500) && router.currentRoute.name !== "InternalServerError") {
        router.push("/InternalServerError");
    } else if (error.response.status === 404 && router.currentRoute.name !== "NotFound") {
        router.push("/NotFound");
    }

    store.dispatch("setLoading", false);
    return Promise.reject(error);
});

function getPost(postId) {
    return instance.get("AutoPosts/" + postId);
}

function getFilters() {
    return instance.get("Filters");
}

// function searchPosts(postId) {
//     return axios.get("https://localhost:44309/Search/Autos" + postId);
// }

export {
    getPost,
    getFilters
};