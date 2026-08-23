import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/*
  PAGE: Devotee Sign In (/auth/user/login)
  
  ACCESS:
  - Unauthenticated Visitors / Customers
  - Logged-in USER is redirected to '/'
  
  PURPOSE:
  - Primary customer authentication portal for devotees to log in.
  
  CREDENTIALS / AUTH MODEL:
  - Identifier: +91 Mobile Number (e.g. +919876543210)
  - Password: User password
  - Post-login destination: '/' (Customer website)
  
  FUTURE CONTENT:
  - Form with +91 phone number input and password input.
  - "Forgot Password?" link -> /auth/user/forgot-password (Email OTP recovery).
  - "Create an Account" link -> /auth/user/register.
  
  DATA SOURCE:
  - Currently: mockUsers in centralized mock data (@/mocks/db)
  - Future: POST /api/v1/auth/user/login
  
  IMPORTANT / VALIDATION:
  - Phone number must start with +91 and have 10 digits.
  - Password minimum 6 characters.
*/
const UserLoginPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Devotee Sign In 🕉️</h1>
        <p className="text-xs text-muted-foreground">
          Enter your registered +91 phone number and password to access your puja bookings.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Add +91 Mobile Number input field */}
        {/* TODO: Add Password input field */}
        {/* TODO: Add 'Sign In' Button triggering authApi.login */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Devotee Phone + Password Login form placeholder]
        </div>

        <div className="flex items-center justify-between text-xs pt-2">
          <Link to="/auth/user/forgot-password" className="text-primary hover:underline">
            Forgot Password?
          </Link>
          <Link to="/auth/user/register" className="text-muted-foreground hover:text-primary">
            New devotee? Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserLoginPage;
