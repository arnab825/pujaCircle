import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types/auth.types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

/**
 * ProtectedRoute
 * Guards routes that require specific roles.
 * - If not logged in -> redirect to /auth/login
 * - If logged in with wrong role -> redirect to role-specific safe home:
 *     - USER   -> /
 *     - PRIEST -> /priest/dashboard
 *     - ADMIN  -> /admin/dashboard
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  // 1. If not logged in, redirect to Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  // 2. If logged in with wrong role, redirect to appropriate role home
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'PRIEST') {
      return <Navigate to="/priest/dashboard" replace />;
    }
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  // 3. User is authorized
  return <>{children}</>;
};

export default ProtectedRoute;
