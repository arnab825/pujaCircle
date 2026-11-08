import React, { useEffect } from 'react';
import { AppRouter } from '@/routes/app-router';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { MotionProvider } from '@/components/common/MotionProvider';
import { Toaster } from '@/components/ui/sonner';
import { useAuthStore } from '@/store/auth.store';

export const App: React.FC = () => {
  const { isAuthenticated, checkSession } = useAuthStore();
  const hasCheckedRef = React.useRef(false);

  useEffect(() => {
    // Silently synchronize session with backend HTTP-only cookie on startup
    if (!hasCheckedRef.current && isAuthenticated) {
      hasCheckedRef.current = true;
      checkSession();
    }
  }, [isAuthenticated, checkSession]);

  return (
    <ErrorBoundary>
      <MotionProvider>
        <AppRouter />
        <Toaster position="top-right" richColors closeButton />
      </MotionProvider>
    </ErrorBoundary>
  );
};

export default App;
