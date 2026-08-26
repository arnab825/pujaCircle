import React from 'react';
import { ForgotPasswordCard } from '@/components/auth/ForgotPasswordCard';

const UserForgotPasswordPage: React.FC = () => {
  return (
    <ForgotPasswordCard
      role="USER"
      loginPath="/auth/user/login"
      resetPath="/auth/user/reset-password"
      demoEmail="user@example.demo"
    />
  );
};

export default UserForgotPasswordPage;
