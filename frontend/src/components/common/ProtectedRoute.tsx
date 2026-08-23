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
 * Guards routes that require specific authenticated roles.
 * - If not logged in -> redirects to appropriate role-specific login (/auth/user/login, /auth/priest/login, /auth/admin/login).
 * - If logged in with wrong role -> redirects to safe role-specific home:
 *     - USER   -> / (Consumer Home)
 *     - PRIEST -> /priest/dashboard
 *     - ADMIN  -> /admin/dashboard
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuthStore();

  // 1. If not authenticated, redirect to appropriate login page
  if (!isAuthenticated || !user) {
    if (allowedRoles.length === 1 && allowedRoles[0] === 'PRIEST') {
      return <Navigate to="/auth/priest/login" replace />;
    }
    if (allowedRoles.length === 1 && allowedRoles[0] === 'ADMIN') {
      return <Navigate to="/auth/admin/login" replace />;
    }
    return <Navigate to="/auth/user/login" replace />;
  }

  // 2. If logged in with unauthorized role, redirect to their role-safe home
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
