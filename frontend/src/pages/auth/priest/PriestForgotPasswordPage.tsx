import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Priest Forgot Password (/auth/priest/forgot-password)
  
  ACCESS:
  - Unauthenticated Purohits
  
  PURPOSE:
  - Account recovery via EMAIL OTP (not phone).
  
  RECOVERY FLOW:
  1. Priest enters registered Email address.
  2. System sends 6-digit Email OTP (Mock OTP: 123456).
  3. Upon verification, redirects to /auth/priest/reset-password.
  
  DATA SOURCE:
  - Future: POST /api/v1/auth/priest/forgot-password
*/
const PriestForgotPasswordPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Recover Purohit Account 🔑</h1>
        <p className="text-xs text-muted-foreground">
          Enter your registered email address to receive a secure password reset OTP.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Email input field */}
        {/* TODO: 'Send Recovery OTP' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Priest Email Recovery Form Placeholder]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/priest/login" className="text-muted-foreground hover:text-primary">
            ← Back to Purohit Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PriestForgotPasswordPage;
