// utils/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080', // URL ของ backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthHeader = (token: string) => {
  api.defaults.headers['Authorization'] = `Bearer ${token}`;
};
