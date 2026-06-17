import axios from "axios";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1", // Adjust as per your backend
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach token if it exists
axiosInstance.interceptors.request.use(
  (config) => {
    // You can get the token from localStorage or cookies
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!localStorage.getItem("token") && typeof window !== "undefined" && window.location.pathname !== "/login") {
       window.location.href = "/login"; 
    }
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors (e.g., token expiration)
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login or clear token)
      console.error("Unauthorized! Token may have expired.");
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login"; // Force redirect on 401
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
