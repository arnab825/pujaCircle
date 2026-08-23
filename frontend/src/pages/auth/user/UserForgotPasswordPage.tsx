import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Devotee Forgot Password (/auth/user/forgot-password)
  
  ACCESS:
  - Unauthenticated Visitors / Customers
  
  PURPOSE:
  - Account recovery via EMAIL (not phone).
  
  RECOVERY FLOW:
  1. User enters registered Email address.
  2. System sends 6-digit Email OTP (Mock OTP: 123456).
  3. Upon verification, redirects to /auth/user/reset-password.
  
  DATA SOURCE:
  - Future: POST /api/v1/auth/user/forgot-password
  
  IMPORTANT:
  - Per specifications, password recovery uses Email OTP, not SMS phone OTP.
*/
const UserForgotPasswordPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Recover Password 🔑</h1>
        <p className="text-xs text-muted-foreground">
          Enter your registered email address to receive a secure password reset OTP.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Email input field */}
        {/* TODO: 'Send Reset OTP' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Email Password Recovery Form Placeholder]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/user/login" className="text-muted-foreground hover:text-primary">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserForgotPasswordPage;
