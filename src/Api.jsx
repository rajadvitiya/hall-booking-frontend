import axios from "axios";

const API = axios.create({ baseURL: "https://hall-booking-backend1.onrender.com/api" });

// Add token for admin requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Example
export const BACKEND_URL = "https://hall-booking-backend1.onrender.com/api";


export default API;
