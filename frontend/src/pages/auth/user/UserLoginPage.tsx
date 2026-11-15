import React from 'react';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';

/**
 * ============================================================================
 * [PAGE: DEVOTEE SIGN IN]
 * Devotee authentication entry point. Uses the unified AuthLoginForm.
 * ============================================================================
 */
export const UserLoginPage: React.FC = () => {
  return (
    <AuthLoginForm
      role="USER"
      title="Devotee Sign In"
      subtitle="Enter your registered credentials to access your booking sanctum."
      forgotPasswordHref="/user/forgot-password"
      registerHref="/user/register"
      registerLabel="Register as Devotee"
      dashboardRedirectHref="/"
      alternateRoleRedirectHref="/priest/login"
    />
  );
};

export default UserLoginPage;
