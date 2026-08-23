import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface GuestOnlyRouteProps {
  children: React.ReactNode;
}

/**
 * GuestOnlyRoute
 * Prevents already authenticated users from viewing Login and Auth pages.
 * - Logged-out -> allowed to access Login/Register
 * - USER       -> redirected to / (Home)
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
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default GuestOnlyRoute;
