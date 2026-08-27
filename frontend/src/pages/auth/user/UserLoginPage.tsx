import React from 'react';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';

const UserLoginPage: React.FC = () => {
  return <AuthLoginForm defaultRole="USER" />;
};

export default UserLoginPage;
