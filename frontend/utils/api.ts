// utils/api.ts
import axios from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL;

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export const setAuthHeader = (token: string) => {
  api.defaults.headers["Authorization"] = `Bearer ${token}`;
};
