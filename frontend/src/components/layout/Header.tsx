import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Sparkles, Calendar, MapPin, User, LogOut } from 'lucide-react';

/**
 * Public Website Header (Used in PublicLayout)
 * Purely customer-facing navigation:
 * - Unauthenticated visitors: About, Contact, Sign In (/auth/user/login), Create Account (/auth/user/register)
 * - Authenticated USER: Rituals, Find a Priest, My Bookings, Saved Addresses, Profile, Logout
 * - Never displays Priest or Admin links.
 */
export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-maroon tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span>
            Puja<span className="text-primary">Circle</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {isAuthenticated && user?.role === 'USER' ? (
            /* Authenticated Customer Navigation */
            <>
              <Link to="/rituals" className="hover:text-primary transition-colors">
                Rituals & Pujas
              </Link>
              <Link to="/priests" className="hover:text-primary transition-colors">
                Find a Priest
              </Link>
              <Link to="/bookings" className="hover:text-primary transition-colors flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>My Bookings</span>
              </Link>
              <Link to="/addresses" className="hover:text-primary transition-colors flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Saved Addresses</span>
              </Link>
              <Link to="/profile" className="hover:text-primary transition-colors flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            /* Unauthenticated Marketing Navigation */
            <>
              <Link to="/about" className="hover:text-primary transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors">
                Contact
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions / Auth Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user?.role === 'USER' ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-2 text-xs">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/user/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth/user/register">
                <Button size="sm">Create Account</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
