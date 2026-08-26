import React from 'react';
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';
import { authApi } from '@/api/auth.api';
import { Phone } from 'lucide-react';

const PriestVerifyPhonePage: React.FC = () => {
  return (
    <OtpVerificationCard
      title="Verify Mobile Number"
      subtitle="Enter the 6-digit verification code sent to your registered mobile."
      icon={<Phone className="h-5 w-5" />}
      loginPath="/auth/priest/login"
      onVerify={(otp) => authApi.verifyPhoneOtp({ phoneNumber: '+919876543211', otp })}
      successMessage="Priest mobile number verified successfully!"
    />
  );
};

export default PriestVerifyPhonePage;
