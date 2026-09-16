import { createApi, setTokenStorage, setToken } from "@church/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

setTokenStorage({
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: (key) => localStorage.removeItem(key),
});

createApi(API_URL);

const savedToken = localStorage.getItem("church_payments_token");
if (savedToken) setToken(savedToken);

export { API_URL };