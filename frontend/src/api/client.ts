import axios, { AxiosInstance } from 'axios';
import { config } from '@/lib/config';
import { useAuthStore } from '@/store/auth.store';

/**
 * Axios HTTP Client
 * Secure cookie-based authentication with HTTP-only cookies and JSON headers.
 * All credentials (cookies) are managed automatically by the browser via withCredentials: true.
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

// Response interceptor with strict error sanitization and 401 session eviction
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 0. Handle 401 Unauthorized: Session expired or account revoked
    // NOTE: Do not trigger session eviction/logout if the 401 was a failed credential response on login/register endpoints!
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      try {
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (
            !currentPath.includes('/login') &&
            !currentPath.includes('/register') &&
            currentPath !== '/'
          ) {
            if (currentPath.startsWith('/priest')) {
              window.location.href = '/priest/login';
            } else if (currentPath.startsWith('/admin')) {
              window.location.href = '/admin/login';
            } else if (currentPath.startsWith('/user')) {
              window.location.href = '/user/login';
            }
          }
        }
      } catch {
        // Ignore browser environment errors
      }
    }

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
