import React from 'react';
import { OtpVerificationCard } from '@/components/auth/OtpVerificationCard';
import { authApi } from '@/api/auth.api';
import { Phone } from 'lucide-react';

const UserVerifyPhonePage: React.FC = () => {
  return (
    <OtpVerificationCard
      title="Verify Mobile Number"
      subtitle="Enter the 6-digit verification code sent to your +91 mobile."
      icon={<Phone className="h-5 w-5" />}
      loginPath="/auth/user/login"
      onVerify={(otp) => authApi.verifyPhoneOtp({ phoneNumber: '+919876543210', otp })}
      successMessage="Mobile number verified successfully!"
    />
  );
};

export default UserVerifyPhonePage;
