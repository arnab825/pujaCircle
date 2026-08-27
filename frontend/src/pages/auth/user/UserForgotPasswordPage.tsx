import React from 'react';
import { ForgotPasswordCard } from '@/components/auth/ForgotPasswordCard';

const UserForgotPasswordPage: React.FC = () => {
  return (
    <ForgotPasswordCard
      role="USER"
      loginPath="/user/login"
      resetPath="/user/reset-password"
      demoEmail="user@example.demo"
    />
  );
};

export default UserForgotPasswordPage;
