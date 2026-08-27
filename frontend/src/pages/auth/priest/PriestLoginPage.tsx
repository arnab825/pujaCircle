import React from 'react';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';

const PriestLoginPage: React.FC = () => {
  return <AuthLoginForm defaultRole="PRIEST" />;
};

export default PriestLoginPage;
