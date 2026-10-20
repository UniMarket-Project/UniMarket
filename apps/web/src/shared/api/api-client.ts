import axios from 'axios';

export const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

export default api;
