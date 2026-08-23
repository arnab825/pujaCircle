import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Sparkles, User, MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, openAuthModal, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-brand-maroon tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span>Puja<span className="text-primary">Circle</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link to="/priests" className="hover:text-primary transition-colors">
            Find Priests
          </Link>
          <Link to="/rituals" className="hover:text-primary transition-colors">
            Rituals & Pujas
          </Link>
          <Link to="/about" className="hover:text-primary transition-colors">
            About Us
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors">
            Contact
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link to="/user/addresses" className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>Addresses</span>
              </Link>
              <Link to="/user/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span>{user.fullName.split(' ')[0]}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => openAuthModal('LOGIN')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => openAuthModal('REGISTER')}>
                Book Priest
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
