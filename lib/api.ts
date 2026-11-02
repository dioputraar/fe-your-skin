import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Otomatis sisipkan Bearer token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tangani 401 Unauthorized secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("token");
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith("/auth/")) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(
          currentPath
        )}&session_expired=true`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
