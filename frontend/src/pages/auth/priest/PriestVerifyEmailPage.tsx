import React from 'react';
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';
import { authApi } from '@/api/auth.api';
import { Mail } from 'lucide-react';

const PriestVerifyEmailPage: React.FC = () => {
  return (
    <OtpVerificationCard
      title="Verify Email Address"
      subtitle="Enter the 6-digit confirmation code sent to your purohit email."
      icon={<Mail className="h-5 w-5" />}
      loginPath="/auth/priest/login"
      onVerify={(otp) => authApi.verifyEmailOtp({ email: 'priest@example.demo', otp })}
      successMessage="Priest email verified successfully!"
    />
  );
};

export default PriestVerifyEmailPage;
