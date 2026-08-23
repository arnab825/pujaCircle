import { create } from 'zustand';
import { AuthUser } from '@/types/auth.types';

/**
 * Auth Store
 * Responsibility: Manages client-side session state (current user, auth status, modal visibility).
 * Note: Avoid putting entire backend collections here; keeps session & UI modal state.
 */
interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authModalView: 'LOGIN' | 'REGISTER' | 'VERIFY_OTP';
  pendingPhoneNumber: string | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  openAuthModal: (view?: 'LOGIN' | 'REGISTER' | 'VERIFY_OTP') => void;
  closeAuthModal: () => void;
  setPendingPhoneNumber: (phone: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    id: 'usr_mock_1',
    fullName: 'Aditi Sharma',
    phoneNumber: '9876543210',
    role: 'USER',
    isPhoneVerified: true,
    createdAt: new Date().toISOString(),
  },
  isAuthenticated: true,
  isAuthModalOpen: false,
  authModalView: 'LOGIN',
  pendingPhoneNumber: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  openAuthModal: (view = 'LOGIN') => set({ isAuthModalOpen: true, authModalView: view }),
  closeAuthModal: () => set({ isAuthModalOpen: false, pendingPhoneNumber: null }),
  setPendingPhoneNumber: (phoneNumber) => set({ pendingPhoneNumber: phoneNumber }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
