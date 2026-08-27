import React from 'react';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { PujaCircleLogo } from '@/components/common/PujaCircleLogo';

const UserLoginPage: React.FC = () => {
  return (
    <AuthLoginForm
      role="USER"
      title="Devotee Sign In"
      subtitle="Enter your mobile number and password to access your puja bookings."
      icon={<PujaCircleLogo size={44} className="shadow-xs" />}
      demoCredentials={{
        phone: '+919876543210',
        pass: 'User@123',
      }}
      redirectPath="/user/home"
      successMessage="Welcome back to PujaCircle!"
      forgotPasswordPath="/user/forgot-password"
      registerPath="/user/register"
      registerPromptText="Don't have a devotee account?"
    />
  );
};

export default UserLoginPage;
