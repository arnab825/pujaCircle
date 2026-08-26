import React from 'react';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { Sparkles } from 'lucide-react';

const UserLoginPage: React.FC = () => {
  return (
    <AuthLoginForm
      role="USER"
      title="Devotee Sign In"
      subtitle="Enter your mobile number and password to access your puja bookings."
      icon={<Sparkles className="h-6 w-6" />}
      demoCredentials={{
        phone: '+919876543210',
        pass: 'User@123',
      }}
      redirectPath="/rituals"
      successMessage="Welcome back to PujaCircle!"
      forgotPasswordPath="/auth/user/forgot-password"
      registerPath="/auth/user/register"
      registerPromptText="Don't have a devotee account?"
    />
  );
};

export default UserLoginPage;
