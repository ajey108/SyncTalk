import axios from "axios";

const API = axios.create({
  baseURL: "https://synctalk-backend.onrender.com",
  withCredentials: true,
});

export default API;
