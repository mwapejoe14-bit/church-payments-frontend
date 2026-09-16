import axios, { AxiosError, AxiosInstance } from "axios";
import type { ApiError } from "./types";

const TOKEN_KEY = "church_payments_token";

let apiInstance: AxiosInstance | null = null;
let inMemoryToken: string | null = null;

export function createApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
    timeout: 30000,
  });

  instance.interceptors.request.use((config) => {
    const token = inMemoryToken || getStoredTokenSync();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (res) => res,
    (error: AxiosError<ApiError>) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      return Promise.reject(new Error(message));
    }
  );

  apiInstance = instance;
  return instance;
}

export function getApi(): AxiosInstance {
  if (!apiInstance) {
    throw new Error("API not initialized. Call createApi(baseURL) first.");
  }
  return apiInstance;
}

export interface TokenStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

let storage: TokenStorage | null = null;

export function setTokenStorage(s: TokenStorage) {
  storage = s;
}

export function getStoredTokenSync(): string | null {
  if (inMemoryToken) return inMemoryToken;
  if (!storage) return null;
  return storage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  inMemoryToken = token;
  if (storage) storage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  inMemoryToken = null;
  if (storage) storage.removeItem(TOKEN_KEY);
}