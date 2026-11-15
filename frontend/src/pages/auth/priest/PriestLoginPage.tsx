import React from 'react';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';

/**
 * ============================================================================
 * [PAGE: VEDIC PUROHIT SIGN IN]
 * Priest authentication entry point. Uses the unified AuthLoginForm.
 * ============================================================================
 */
export const PriestLoginPage: React.FC = () => {
  return (
    <AuthLoginForm
      role="PRIEST"
      title="Vedic Purohit Sign In"
      subtitle="Enter your registered credentials to access your Purohit dashboard."
      forgotPasswordHref="/priest/forgot-password"
      registerHref="/priest/register"
      registerLabel="Register as Purohit"
      dashboardRedirectHref="/priest/dashboard"
      alternateRoleRedirectHref="/user/login"
    />
  );
};

export default PriestLoginPage;
