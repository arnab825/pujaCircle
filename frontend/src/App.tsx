import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from '@/routes/app-router';
import { AuthModal } from '@/components/auth/AuthModal';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={appRouter} />
      <AuthModal />
    </ErrorBoundary>
  );
};

export default App;
