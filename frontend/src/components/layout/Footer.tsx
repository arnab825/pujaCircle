import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Sparkles } from 'lucide-react';
import { APP_CONFIG } from '@/lib/constants';

/**
 * Compact Marketing / Global Footer
 * Sleek, minimal and non-intrusive.
 */
export const Footer: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isDevotee = isAuthenticated && user?.role === 'USER';

  return (
    <footer className="border-t bg-card/60 backdrop-blur-sm text-muted-foreground mt-auto py-6">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-foreground">
            Puja<span className="text-primary">Circle</span>
          </span>
          <span className="hidden md:inline text-muted-foreground/60">•</span>
          <span className="hidden md:inline text-muted-foreground text-[11px]">
            {APP_CONFIG.TAGLINE}
          </span>
        </div>

        {/* Minimal Navigation Links */}
        <div className="flex items-center gap-4 text-xs">
          {isDevotee ? (
            <>
              <Link to="/user/priests" className="hover:text-primary transition-colors">
                Find Priests
              </Link>
              <Link to="/user/bookings" className="hover:text-primary transition-colors">
                My Bookings
              </Link>
              <Link to="/user/addresses" className="hover:text-primary transition-colors">
                Addresses
              </Link>
              <Link to="/user/profile" className="hover:text-primary transition-colors">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/about" className="hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/priest/login" className="hover:text-primary transition-colors font-medium">
                Purohit Portal
              </Link>
            </>
          )}
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-muted-foreground/80">
          © {new Date().getFullYear()} {APP_CONFIG.APP_NAME}. Direct Cash Dakshina.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
