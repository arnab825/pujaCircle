import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface PublicRouteGuardProps {
  children: React.ReactNode;
}

/**
 * PublicRouteGuard
 * Enforces workspace isolation on public consumer pages (PublicLayout).
 * - Logged-out visitors -> allowed to view website
 * - USER -> allowed to view consumer website
 * - PRIEST -> automatically redirected to /priest/dashboard
 * - ADMIN  -> automatically redirected to /admin/dashboard
 */
export const PublicRouteGuard: React.FC<PublicRouteGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === 'PRIEST') {
      return <Navigate to="/priest/dashboard" replace />;
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default PublicRouteGuard;
