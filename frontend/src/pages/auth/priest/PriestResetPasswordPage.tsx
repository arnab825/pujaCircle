import React from 'react';
import { ResetPasswordCard } from '@/components/auth/ResetPasswordCard';

const PriestResetPasswordPage: React.FC = () => {
  return (
    <ResetPasswordCard
      role="PRIEST"
      loginPath="/auth/priest/login"
      demoPassword="Priest@123"
    />
  );
};

export default PriestResetPasswordPage;
