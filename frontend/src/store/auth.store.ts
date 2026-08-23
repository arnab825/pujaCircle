import { create } from 'zustand';
import { AuthUser, LoginCredentials } from '@/types/auth.types';
import { authApi } from '@/api/auth.api';

const STORAGE_KEY = 'pujacircle-mock-auth';

// Helper to read initial saved user from localStorage
function getSavedUser(): AuthUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Simple actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  clearError: () => void;
}

const initialUser = getSavedUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  isAuthenticated: initialUser !== null,
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authApi.login(credentials);

      if (response.success && response.data?.user) {
        const user = response.data.user;
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } catch {
          // Continue if localStorage is unavailable
        }
        set({ user, isAuthenticated: true, isLoading: false, error: null });
        return true;
      } else {
        set({ error: response.message, isLoading: false });
        return false;
      }
    } catch {
      set({ error: 'An error occurred during login. Please try again.', isLoading: false });
      return false;
    }
  },

  logout: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Continue
    }
    set({ user: null, isAuthenticated: false, error: null });
  },

  setUser: (user: AuthUser | null) => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Continue
    }
    set({ user, isAuthenticated: user !== null });
  },

  clearError: () => set({ error: null }),
}));
