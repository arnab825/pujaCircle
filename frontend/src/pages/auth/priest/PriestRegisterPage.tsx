import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Priest Onboarding Application (/auth/priest/register)
  
  ACCESS:
  - Unauthenticated Vedic scholars / Purohits
  
  PURPOSE:
  - Priest onboarding application collecting Vedic credentials and service regions.
  
  FLOW / ONBOARDING STEPS:
  1. Personal Credentials: Full Name, Password, Confirm Password.
  2. Phone Verification (+91 OTP).
  3. Email Verification (Email OTP).
  4. Vedic Background: Gurukul lineage, Experience in years, Languages, Bio.
  5. Ritual Specializations & Service Cities/Areas.
  6. Submission:
     - Account created with status: PENDING ADMIN APPROVAL.
     - Priest is notified that the administrator must approve their profile before they are listed.
  
  DATA SOURCE:
  - Future: POST /api/v1/auth/priest/register
*/
const PriestRegisterPage: React.FC = () => {
  return (
    <div className="container max-w-lg py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Join as a Vedic Purohit 🪔</h1>
        <p className="text-xs text-muted-foreground">
          Apply to offer your Vedic ritual seva to households and devotees across your city.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Personal Info fields (Name, Password) */}
        {/* TODO: Phone + Email OTP validation steps */}
        {/* TODO: Vedic Qualifications (Gurukul, Years of Experience, Languages, Bio) */}
        {/* TODO: Specializations (Griha Pravesh, Havan, Katha) & Service City */}
        {/* TODO: 'Submit Application' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Priest Onboarding Application Multi-Step Form Placeholder]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/priest/login" className="text-muted-foreground hover:text-primary">
            Already registered? <span className="text-primary font-medium">Sign In</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PriestRegisterPage;
