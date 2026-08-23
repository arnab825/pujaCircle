import axios, { AxiosInstance } from 'axios';
import { config } from '@/lib/config';

/**
 * Axios HTTP Client Template
 * Preconfigured for future Backend API connection with HTTP-only cookies and JSON headers.
 * In Phase 1 initial development, the api services delegate directly to the mock API layer.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
  timeout: config.defaultTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor placeholder
apiClient.interceptors.request.use(
  (requestConfig) => {
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor placeholder
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);
