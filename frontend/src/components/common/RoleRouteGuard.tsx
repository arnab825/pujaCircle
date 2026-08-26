import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

/**
 * UserRouteGuard
 * Protects Devotee (/user/*) routes strictly for authenticated USER role.
 */
export const UserRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/user/login" state={{ from: location }} replace />;
  }

  if (user.role === 'PRIEST') {
    return <Navigate to="/priest/dashboard" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * PriestRouteGuard
 * Protects Priest (/priest/*) workspace routes strictly for authenticated PRIEST role.
 */
export const PriestRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/priest/login" state={{ from: location }} replace />;
  }

  if (user.role === 'USER') {
    return <Navigate to="/user/home" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * AdminRouteGuard
 * Protects Admin (/admin/*) console strictly for authenticated ADMIN role.
 */
export const AdminRouteGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/admin/login" state={{ from: location }} replace />;
  }

  if (user.role === 'USER') {
    return <Navigate to="/user/home" replace />;
  }

  if (user.role === 'PRIEST') {
    return <Navigate to="/priest/dashboard" replace />;
  }

  return <>{children}</>;
};
