import axios from 'axios';

const CLOUD_BACKEND = 'https://cv-auto-ticket-generation.onrender.com';

// Use VITE_API_URL if explicitly set, otherwise use cloud backend in production
// or dynamic hostname for local development.
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
  : import.meta.env.PROD
    ? CLOUD_BACKEND
    : `http://${window.location.hostname}:${import.meta.env.VITE_API_PORT || '5000'}`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
