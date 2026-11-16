
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  try {
    const saved = sessionStorage.getItem("skillarena_session");
    const session = saved ? JSON.parse(saved) : null;

    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch {
    sessionStorage.removeItem("skillarena_session");
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem("skillarena_session");
      window.dispatchEvent(new Event("skillarena:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;
