import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { appRouter } from '@/routes/app-router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MotionProvider } from '@/components/common/MotionProvider';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/auth.store';

export const App: React.FC = () => {
  const { isAuthenticated, checkSession } = useAuthStore();

  useEffect(() => {
    // Silently synchronize session with backend HTTP-only cookie on startup
    if (isAuthenticated) {
      checkSession();
    }
  }, []);

  return (
    <ErrorBoundary>
      <MotionProvider>
        <RouterProvider router={appRouter} />
        <Toaster position="top-right" richColors closeButton />
      </MotionProvider>
    </ErrorBoundary>
  );
};

export default App;
