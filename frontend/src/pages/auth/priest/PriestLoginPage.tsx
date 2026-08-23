import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Priest Sign In (/auth/priest/login)
  
  ACCESS:
  - Unauthenticated Purohits / Vedic scholars
  - Logged-in PRIEST is redirected directly to '/priest/dashboard'
  
  PURPOSE:
  - Dedicated authentication entry for verified Vedic Purohits.
  
  CREDENTIALS / AUTH MODEL:
  - Identifier: +91 Mobile Number (e.g. +919876543211)
  - Password: Priest password
  - Post-login destination: '/priest/dashboard'
  
  FUTURE CONTENT:
  - Form with +91 phone number input and password input.
  - "Forgot Password?" link -> /auth/priest/forgot-password (Email OTP recovery).
  - "Apply as a Purohit" link -> /auth/priest/register.
  
  DATA SOURCE:
  - Currently: mockUsers (role === 'PRIEST') in centralized mock data (@/mocks/db)
  - Future: POST /api/v1/auth/priest/login
  
  IMPORTANT:
  - Does NOT lead to customer website. Strict role isolation sends priest to Priest Workspace.
*/
const PriestLoginPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Purohit Portal Sign In 🪔</h1>
        <p className="text-xs text-muted-foreground">
          Enter your registered +91 phone number and password to access your priest workspace.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Add +91 Mobile Number field */}
        {/* TODO: Add Password field */}
        {/* TODO: Add 'Sign In to Workspace' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Priest Phone + Password Login form placeholder]
        </div>

        <div className="flex items-center justify-between text-xs pt-2">
          <Link to="/auth/priest/forgot-password" className="text-primary hover:underline">
            Forgot Password?
          </Link>
          <Link to="/auth/priest/register" className="text-muted-foreground hover:text-primary">
            New Purohit? Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PriestLoginPage;
