import axios, { AxiosInstance } from 'axios';
import { config } from '@/lib/config';

/**
 * Axios HTTP Client Template
 * Preconfigured for future Backend API connection with HTTP-only cookies and JSON headers.
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

// Request interceptor: attach bearer token from Zustand persisted storage
apiClient.interceptors.request.use(
  (requestConfig) => {
    try {
      const stored = localStorage.getItem('pujacircle-auth-storage');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.token && requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${state.token}`;
        }
      }
    } catch {
      // Ignore parse failure; credentials sent via withCredentials
    }
    return requestConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with strict error sanitization
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 1. Sanitized server-returned operational message
    if (error.response?.data?.message && typeof error.response.data.message === 'string') {
      return Promise.reject(new Error(error.response.data.message));
    }

    // 2. Network connectivity issue
    if (!error.response) {
      return Promise.reject(
        new Error('Unable to connect to the PujaCircle server. Please check your internet connection.')
      );
    }

    // 3. Fallback for 500 or unexpected exceptions
    return Promise.reject(
      new Error('An unexpected server error occurred. Please try again in a few moments.')
    );
  }
);
