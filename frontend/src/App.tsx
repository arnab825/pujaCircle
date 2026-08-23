import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from '@/routes/app-router';
import { AuthModal } from '@/components/auth/AuthModal';

export const App: React.FC = () => {
  return (
    <>
      <RouterProvider router={appRouter} />
      <AuthModal />
    </>
  );
};

export default App;
