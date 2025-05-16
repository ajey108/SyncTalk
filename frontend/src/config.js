// src/config.js
export const isProduction = process.env.NODE_ENV === "production";
export const API_URL = isProduction
  ? "https://synctalk-backend.onrender.com/api"
  : "http://localhost:5000/api";
export const SOCKET_URL = isProduction
  ? "https://synctalk-backend.onrender.com"
  : "http://localhost:5000";
