import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Priest Reset Password (/auth/priest/reset-password)
  
  ACCESS:
  - Purohits with verified Email recovery OTP
  
  PURPOSE:
  - Set a new password for priest account after email OTP validation.
  
  DATA SOURCE:
  - Future: POST /api/v1/auth/priest/reset-password
*/
const PriestResetPasswordPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Set New Purohit Password 🔒</h1>
        <p className="text-xs text-muted-foreground">
          Create a new secure password for your priest account.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: New Password and Confirm Password inputs */}
        {/* TODO: 'Update Password' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Set New Priest Password Form Placeholder]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/priest/login" className="text-primary hover:underline">
            Sign In with new password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PriestResetPasswordPage;
