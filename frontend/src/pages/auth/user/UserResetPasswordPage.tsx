import React from 'react';
import { ResetPasswordCard } from '@/components/auth/ResetPasswordCard';

const UserResetPasswordPage: React.FC = () => {
  return (
    <ResetPasswordCard
      role="USER"
      loginPath="/auth/user/login"
      demoPassword="User@123"
    />
  );
};

export default UserResetPasswordPage;
