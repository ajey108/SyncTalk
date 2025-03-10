import axios from "axios";
const cloudinaryAPI = axios.create({
  baseURL: "https://api.cloudinary.com/v1_1/dx3koca3j",
  withCredentials: false, //  false
});

export default cloudinaryAPI;
