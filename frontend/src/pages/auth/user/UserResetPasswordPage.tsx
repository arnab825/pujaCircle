import React from 'react';
import { Link } from 'react-router-dom';

/*
  PAGE: Devotee Reset Password (/auth/user/reset-password)
  
  ACCESS:
  - Users with verified Email recovery OTP
  
  PURPOSE:
  - Set a new secure password after email OTP validation.
  
  FIELDS:
  - New Password
  - Confirm New Password
  
  DATA SOURCE:
  - Future: POST /api/v1/auth/user/reset-password
*/
const UserResetPasswordPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-foreground">Set New Password 🔒</h1>
        <p className="text-xs text-muted-foreground">
          Create a new secure password for your devotee account.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: New Password and Confirm Password inputs */}
        {/* TODO: 'Update Password' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Set New Password Form Placeholder]
        </div>

        <div className="text-center text-xs pt-2">
          <Link to="/auth/user/login" className="text-primary hover:underline">
            Sign In with new password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserResetPasswordPage;
