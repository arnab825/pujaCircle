import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/sonner';
import { GridBackground } from '@/components/common/GridBackground';

/**
 * PublicLayout
 * Used for the consumer-facing website and standard USER experience.
 * Consists of standard top Header, Main content with shimmering GridBackground, and Footer.
 */
export const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Header />
      <main className="flex-1 relative">
        <GridBackground>
          <Outlet />
        </GridBackground>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
};

export default PublicLayout;
