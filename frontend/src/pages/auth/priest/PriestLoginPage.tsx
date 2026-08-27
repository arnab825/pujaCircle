import React from 'react';
import { AuthLoginForm } from '@/components/auth/AuthLoginForm';
import { PujaCircleLogo } from '@/components/common/PujaCircleLogo';

const PriestLoginPage: React.FC = () => {
  return (
    <AuthLoginForm
      role="PRIEST"
      title="PujaCircle for Priests"
      subtitle="Welcome, Pandit Ji. Manage your ritual schedules and ceremony appointments."
      icon={<PujaCircleLogo size={44} className="shadow-xs" />}
      demoCredentials={{
        phone: '+919876543211',
        pass: 'Priest@123',
      }}
      redirectPath="/priest/dashboard"
      successMessage="Welcome to your Purohit Workspace!"
      forgotPasswordPath="/auth/priest/forgot-password"
      registerPath="/auth/priest/register"
      registerPromptText="Are you a Purohit wanting to join?"
    />
  );
};

export default PriestLoginPage;
