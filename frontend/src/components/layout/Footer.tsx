import React from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { PujaCircleLogo } from "@/components/common/PujaCircleLogo";
import { APP_CONFIG } from "@/lib/constants";

/**
 * Compact Marketing / Global Footer
 * Sleek, minimal and non-intrusive.
 */
export const Footer: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isDevotee = isAuthenticated && user?.role === "USER";

  return (
    <footer className="border-t border-border bg-card text-muted-foreground mt-auto py-6">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-2">
          <PujaCircleLogo size={24} className="shadow-xs" />
          <span className="font-semibold text-foreground">
            Puja<span className="text-primary">Circle</span>
          </span>
        </div>

        {/* Minimal Navigation Links */}
        <div className="flex items-center gap-4 text-xs">
          {isDevotee ? (
            <>
              <Link
                to="/user/priests"
                className="hover:text-primary transition-colors"
              >
                Find Priests
              </Link>
              <Link
                to="/user/bookings"
                className="hover:text-primary transition-colors"
              >
                My Bookings
              </Link>
              <Link
                to="/user/addresses"
                className="hover:text-primary transition-colors"
              >
                Addresses
              </Link>
            </>
          ) : (
            <>
              <Link to="/" className="hover:text-primary transition-colors">
                Home
              </Link>
              <Link
                to="/about"
                className="hover:text-primary transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                to="/priest/login"
                className="hover:text-primary transition-colors font-medium"
              >
                Purohit Portal
              </Link>
            </>
          )}
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-muted-foreground/80">
          © {new Date().getFullYear()} {APP_CONFIG.APP_NAME}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
