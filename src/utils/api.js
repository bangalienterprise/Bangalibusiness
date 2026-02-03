import axios from 'axios';
import * as Sentry from "@sentry/react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '', // Fallback or empty if using relative paths
  timeout: 10000,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized Error Logging
    console.error('API Error:', error);
    Sentry.captureException(error);
    
    if (error.response) {
      // Handle specific status codes
      if (error.response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
