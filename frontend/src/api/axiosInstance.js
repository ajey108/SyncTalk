import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Update with your backend URL
  withCredentials: true, // Allows cookies (for authentication)
});

export default API;
