import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Sparkles,
  Calendar,
  MapPin,
  User,
  LogOut,
  Home,
  Search,
  Menu,
  Phone,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Public Website Header (Used in PublicLayout)
 * Purely customer-facing navigation:
 * - Unauthenticated visitors: Home (/), About (/about), Contact (/contact), Sign In (/user/login), Create Account (/user/register)
 * - Authenticated USER: Home (/user/home), Find Priests (/user/priests), My Bookings (/user/bookings), Addresses (/user/addresses), Profile (/user/profile), Logout
 * - Fully responsive with mobile slide-out drawer
 */
export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'transition-colors font-medium text-sm flex items-center gap-1.5 py-1 px-2.5 rounded-md',
      isActive
        ? 'text-primary font-semibold bg-primary/10'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
    );

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
      isActive
        ? 'bg-primary/10 text-primary font-semibold'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium">
          {isAuthenticated && user?.role === 'USER' ? (
            /* Authenticated Customer Navigation */
            <>
              <NavLink to="/user/home" className={navLinkClass}>
                <Home className="h-4 w-4" />
                <span>Home</span>
              </NavLink>
              <NavLink to="/user/priests" className={navLinkClass}>
                <Search className="h-4 w-4" />
                <span>Find Priests</span>
              </NavLink>
              <NavLink to="/user/bookings" className={navLinkClass}>
                <Calendar className="h-4 w-4" />
                <span>My Bookings</span>
              </NavLink>
              <NavLink to="/user/addresses" className={navLinkClass}>
                <MapPin className="h-4 w-4" />
                <span>Saved Addresses</span>
              </NavLink>
            </>
          ) : (
            /* Unauthenticated Marketing Navigation */
            <>
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/about" className={navLinkClass}>
                About 
              </NavLink>
              <NavLink to="/contact" className={navLinkClass}>
                Contact
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Actions / Auth Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated && user?.role === 'USER' ? (
            <div className="hidden sm:flex items-center gap-2">
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
                <span>Logout</span>
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/user/login">
                <Button variant="ghost" size="sm" className="text-xs">Sign In</Button>
              </Link>
              <Link to="/user/register">
                <Button size="sm" className="text-xs">Create Account</Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Drawer */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 text-foreground"
                aria-label="Open Navigation Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] flex flex-col justify-between p-6">
              <div className="space-y-6">
                <SheetHeader className="text-left border-b pb-4">
                  <SheetTitle className="flex items-center gap-2 font-serif text-lg">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <span>Puja<span className="text-primary font-sans font-bold">Circle</span></span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Links */}
                <div className="flex flex-col space-y-1">
                  {isAuthenticated && user?.role === 'USER' ? (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Navigation
                      </div>
                      <NavLink
                        to="/user/home"
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </NavLink>
                      <NavLink
                        to="/user/priests"
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <Search className="h-4 w-4" />
                        <span>Find Priests</span>
                      </NavLink>
                      <NavLink
                        to="/user/bookings"
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>My Bookings</span>
                      </NavLink>
                      <NavLink
                        to="/user/addresses"
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <MapPin className="h-4 w-4" />
                        <span>Saved Addresses</span>
                      </NavLink>
                      <NavLink
                        to="/user/profile"
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile</span>
                      </NavLink>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Menu
                      </div>
                      <NavLink
                        to="/"
                        end
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <Home className="h-4 w-4" />
                        <span>Home</span>
                      </NavLink>
                      <NavLink
                        to="/about"
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <Info className="h-4 w-4" />
                        <span>About</span>
                      </NavLink>
                      <NavLink
                        to="/contact"
                        className={mobileNavLinkClass}
                        onClick={() => setIsOpen(false)}
                      >
                        <Phone className="h-4 w-4" />
                        <span>Contact</span>
                      </NavLink>
                    </>
                  )}
                </div>
              </div>

              {/* Bottom Mobile Actions */}
              <div className="border-t pt-4 space-y-2">
                {isAuthenticated && user?.role === 'USER' ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 border-destructive/20 text-xs"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Link to="/user/login" onClick={() => setIsOpen(false)} className="block w-full">
                      <Button variant="outline" className="w-full text-xs">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/user/register" onClick={() => setIsOpen(false)} className="block w-full">
                      <Button className="w-full text-xs">
                        Create Account
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
