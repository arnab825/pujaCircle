import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthUser, LoginCredentials } from '@/types/auth.types';
import { authApi } from '@/api/auth.api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(credentials);

          if (response.success && response.data?.user) {
            const user = response.data.user;
            const token = response.data.token || null;
            if (token) localStorage.setItem('pujacircle_token', token);
            set({ user, token, isAuthenticated: true, isLoading: false, error: null });
            return true;
          } else {
            set({ error: response.message || 'Login failed', isLoading: false });
            return false;
          }
        } catch {
          set({ error: 'An unexpected error occurred during sign-in. Please try again.', isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      setUser: (user: AuthUser | null) => {
        set({ user, isAuthenticated: user !== null });
      },

      setToken: (token: string | null) => {
        set({ token });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'pujacircle-auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
