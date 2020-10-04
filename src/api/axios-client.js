import router from "../router";
import store from "../store";
import axios from "axios";

const instance = axios.create({
    baseURL: "https://localhost:44309/"
});

instance.interceptors.response.use(function (response) {
    store.dispatch("setLoading", false);
    return response;
}, function (error) {
    if ((!error.response || error.response.status === 500) && router.currentRoute.name !== "Error") {
        router.push("/Error");
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

export {
    getPost,
    getFilters
};