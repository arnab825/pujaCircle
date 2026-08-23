import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Devotee Phone Verification (/auth/user/verify-phone)
  
  ACCESS:
  - Unauthenticated Visitors / Customers during registration
  
  PURPOSE:
  - Validates ownership of +91 Indian mobile number via 6-digit SMS OTP.
  
  FLOW:
  - User enters 6-digit OTP (Mock OTP: 123456).
  - Resend OTP countdown timer (30s).
  
  DATA SOURCE:
  - Future: POST /api/v1/auth/user/verify-phone-otp
*/
const UserVerifyPhonePage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Verify Phone Number 📱</h1>
        <p className="text-xs text-muted-foreground">
          Enter the 6-digit verification code sent to your +91 mobile number.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: 6-digit OTP input boxes */}
        {/* TODO: 'Verify Phone' submit button */}
        {/* TODO: Resend OTP countdown link */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Phone OTP Verification Form Placeholder (Mock OTP: 123456)]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/user/register" className="text-muted-foreground hover:text-primary">
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserVerifyPhonePage;
