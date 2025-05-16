// src/api.js
import axios from "axios";
import { API_URL } from "./config";

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default API;
