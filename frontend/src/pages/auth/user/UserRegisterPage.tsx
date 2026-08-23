import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Devotee Registration (/auth/user/register)
  
  ACCESS:
  - Unauthenticated Visitors / Customers
  
  PURPOSE:
  - Full devotee account creation with contact verification and mandatory home address.
  
  FLOW / ONBOARDING STEPS:
  1. Personal Details: Full Name, Password, Confirm Password.
  2. Mobile Verification: +91 Phone Number + OTP (Mock OTP: 123456).
  3. Email Verification: Email Address + Email OTP (Mock OTP: 123456).
  4. Address Collection:
     - PIN Code lookup (auto-resolves Post Office, Locality, City, District, State).
     - Flat / House / Building, Street / Road, Landmark.
  5. Account Completion:
     - Instantly creates USER account, sets hasAddress: true, logs in, redirects to '/'.
  
  DATA SOURCE:
  - PIN code lookup: mockPincodeDatabase from centralized mock data (@/mocks/db)
  - Future: POST /api/v1/auth/user/register with address payload
  
  IMPORTANT / VALIDATION:
  - Phone (+91 10 digits) and Email must both be verified via OTP.
  - Address is mandatory for customer account creation so location-dependent booking features work immediately.
*/
const UserRegisterPage: React.FC = () => {
  return (
    <div className="container max-w-lg py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Create Devotee Account 🕉️</h1>
        <p className="text-xs text-muted-foreground">
          Register to book sacred Vedic rituals and connect with verified Purohits in your locality.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Personal Info fields (Name, Password) */}
        {/* TODO: Phone Number + Phone OTP verification (123456) */}
        {/* TODO: Email Address + Email OTP verification (123456) */}
        {/* TODO: PIN Code auto-detection & Address inputs (House, Street, Locality, City, State) */}
        {/* TODO: 'Create Account' submit action */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Devotee Multi-Step Registration Form Placeholder]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/user/login" className="text-muted-foreground hover:text-primary">
            Already have an account? <span className="text-primary font-medium">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserRegisterPage;
