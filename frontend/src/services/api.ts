import axios from "axios";

const api = axios.create({
    baseURL: environment.apiURL,
});

export default api;