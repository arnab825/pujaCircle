import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { SacredBackground } from '@/components/common/SacredBackground';

/**
 * PublicLayout
 * Used for the consumer-facing website and standard USER experience.
 * Serene, eye-pleasing Chandan Ivory canvas with animated sacred mandalas and warm ambient lighting.
 */
export const PublicLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col font-sans text-stone-900 relative w-full max-w-full overflow-x-clip">
      <SacredBackground />
      <Navbar />
      <main className="flex-1 relative z-10 w-full max-w-full overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
