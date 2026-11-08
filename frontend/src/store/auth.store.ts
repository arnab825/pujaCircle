import { create } from 'zustand';
import { AuthUser, LoginCredentials } from '@/types/auth.types';
import { authApi } from '@/api/auth.api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data?.user) {
        set({ user: response.data.user, isAuthenticated: true, isInitialized: true, isLoading: false, error: null });
        return true;
      } else {
        const message = response.message || 'Invalid email or password. Please check your credentials and try again.';
        set({ error: message, isLoading: false });
        return false;
      }
    } catch (err: any) {
      const message = err?.message || 'An unexpected error occurred during sign-in. Please try again.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network errors during logout
    } finally {
      set({ user: null, isAuthenticated: false, isInitialized: true, error: null });
    }
  },

  checkSession: async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.data?.user) {
        set({ user: res.data.user, isAuthenticated: true, isInitialized: true });
      } else {
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },

  setUser: (user: AuthUser | null) => {
    set({ user, isAuthenticated: user !== null, isInitialized: true });
  },

  clearError: () => set({ error: null }),
}));
