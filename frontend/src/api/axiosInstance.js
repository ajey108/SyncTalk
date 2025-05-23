import axios from "axios";

const API = axios.create({
  baseURL: "https://synctalk-backend.onrender.com/api",
  withCredentials: true,
});

export default API;

//"http://localhost:5000/api"
