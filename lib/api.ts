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

// Response Interceptor: Tangani 401 Unauthorized pada rute terproteksi
const PROTECTED_PREFIXES = ["/brand", "/product", "/category", "/ingredient"];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("token");
      const currentPath = window.location.pathname;
      const isProtected = PROTECTED_PREFIXES.some((prefix) =>
        currentPath.startsWith(prefix)
      );
      if (isProtected) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(
          currentPath
        )}`;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
