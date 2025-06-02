import axios from "axios";

const API = axios.create({
  baseURL: `http://localhost:5000/api`, // Replace with your API URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 10000,
});
export default API;

//"http://localhost:5000/api"
//${import.meta.env.VITE_API_URL}
