import axios from 'axios';

// Use the current browser hostname so the app works on any network/hotspot.
// Falls back to VITE_API_URL (for production builds) then localhost.
const backendPort = import.meta.env.VITE_API_PORT || '5000';
export const API_BASE_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
  : `http://${window.location.hostname}:${backendPort}`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});
