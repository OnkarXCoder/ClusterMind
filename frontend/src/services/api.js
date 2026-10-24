import axios from "axios";

const RAW_API_URL = import.meta.env.VITE_API_URL || "/api";
const API_URL =
  RAW_API_URL.replace(/\/+$/, "").replace(/\/api$/, "") + "/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("clustermind_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const isBackendReachable = async () => {
  try {
    const res = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    return res.data && res.data.status === "ok";
  } catch {
    return false;
  }
};

export default api;
