import React from 'react';
import { ForgotPasswordCard } from '@/components/auth/ForgotPasswordCard';

const PriestForgotPasswordPage: React.FC = () => {
  return (
    <ForgotPasswordCard
      role="PRIEST"
      loginPath="/priest/login"
      resetPath="/priest/reset-password"
      demoEmail="priest@example.demo"
    />
  );
};

export default PriestForgotPasswordPage;
