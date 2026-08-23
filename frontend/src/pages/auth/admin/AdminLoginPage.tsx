import React from 'react';

/*
  PAGE: Platform Administrator Login (/auth/admin/login)
  
  ACCESS:
  - Internal Platform Administrators (ADMIN role)
  - Hidden private entry (NOT linked in public navbar or footer)
  
  PURPOSE:
  - Private login console for platform governance and priest approvals.
  
  CREDENTIALS / AUTH MODEL:
  - Identifier: Administrator Email (e.g. admin@pujacircle.demo)
  - Password: Admin Password
  - Post-login destination: '/admin/dashboard'
  
  DATA SOURCE:
  - Currently: mockUsers (role === 'ADMIN') in centralized mock data (@/mocks/db)
  - Future: POST /api/v1/auth/admin/login
*/
const AdminLoginPage: React.FC = () => {
  return (
    <div className="container max-w-md py-12 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold font-serif text-destructive">Platform Admin Console 🛡️</h1>
        <p className="text-xs text-muted-foreground">
          Internal administrative login for PujaCircle operations & priest verification.
        </p>
      </div>

      <div className="p-6 border rounded-lg bg-card space-y-4">
        {/* TODO: Admin Email input field */}
        {/* TODO: Admin Password input field */}
        {/* TODO: 'Access Console' button */}
        <div className="p-4 bg-muted/40 rounded border text-xs text-muted-foreground text-center">
          [Admin Private Email + Password Login Form Placeholder]
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
