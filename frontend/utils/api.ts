// utils/api.ts
import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
export const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const setAuthHeader = (token: string) => {
  api.defaults.headers["Authorization"] = `Bearer ${token}`;
};
