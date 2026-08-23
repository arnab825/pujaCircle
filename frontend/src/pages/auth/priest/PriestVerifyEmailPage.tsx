import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Priest Email Verification (/auth/priest/verify-email)
  
  ACCESS:
  - Purohits during onboarding application
  
  PURPOSE:
  - Validates ownership of purohit email address via 6-digit Email OTP (Mock OTP: 123456).
  
  DATA SOURCE:
  - Future: POST /api/v1/auth/priest/verify-email-otp
*/
const PriestVerifyEmailPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Verify Purohit Email ✉️</h1>
        <p className="text-xs text-muted-foreground">
          Enter the 6-digit verification code sent to your registered email address.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: 6-digit Email OTP inputs */}
        {/* TODO: 'Verify Email' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Priest Email OTP Verification Form Placeholder]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/priest/register" className="text-muted-foreground hover:text-primary">
            ← Back to Application
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PriestVerifyEmailPage;
