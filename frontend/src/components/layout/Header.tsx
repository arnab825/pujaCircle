import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Sparkles, Calendar, MapPin, User, LogOut, Home, Search } from 'lucide-react';

/**
 * Public Website Header (Used in PublicLayout)
 * Purely customer-facing navigation:
 * - Unauthenticated visitors: Home (/), About (/about), Contact (/contact), Sign In (/user/login), Create Account (/user/register)
 * - Authenticated USER: Home (/user/home), Find Priests (/user/priests), My Bookings (/user/bookings), Addresses (/user/addresses), Profile (/user/profile), Logout
 * - Never displays Admin login links.
 */
export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link
          to={isAuthenticated && user?.role === 'USER' ? '/user/home' : '/'}
          className="flex items-center gap-2 font-bold text-xl text-foreground tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-serif">
            Puja<span className="text-primary font-sans font-bold">Circle</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          {isAuthenticated && user?.role === 'USER' ? (
            /* Authenticated Customer Navigation */
            <>
              <Link to="/user/home" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link to="/user/priests" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Search className="h-4 w-4" />
                <span>Find Priests</span>
              </Link>
              <Link to="/user/bookings" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>My Bookings</span>
              </Link>
              <Link to="/user/addresses" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>Saved Addresses</span>
              </Link>
              <Link to="/user/profile" className="hover:text-primary transition-colors flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </>
          ) : (
            /* Unauthenticated Marketing Navigation */
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
            </>
          )}
        </nav>

        {/* Right Actions / Auth Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user?.role === 'USER' ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/user/profile">
                <Button variant="ghost" size="sm" className="gap-2 text-xs">
                  <User className="h-3.5 w-3.5 text-primary" />
                  <span className="max-w-30 truncate">{user.name}</span>
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
              <Link to="/user/login">
                <Button variant="ghost" size="sm" className="text-xs">Sign In</Button>
              </Link>
              <Link to="/user/register">
                <Button size="sm" className="text-xs">Create Account</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
