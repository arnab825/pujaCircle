import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * GuestOnlyRoute
 * Prevents authenticated users from viewing unauthenticated marketing and auth pages.
 * - Logged-out -> allowed to access marketing/landing and auth pages.
 * - USER       -> redirected to /user/home
 * - PRIEST     -> redirected to /priest/dashboard
 * - ADMIN      -> redirected to /admin/dashboard
 */
export const GuestOnlyRoute: React.FC<GuestOnlyRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'PRIEST') {
      return <Navigate to="/priest/dashboard" replace />;
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/user/home" replace />;
  }

  return <>{children}</>;
};

export default GuestOnlyRoute;
