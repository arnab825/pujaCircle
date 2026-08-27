import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth.store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Home,
  Search,
  Calendar,
  MapPin,
  User,
  LogOut,
  Menu,
  Phone,
  Info,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PujaCircleLogo } from '@/components/common/PujaCircleLogo';

/**
 * Public Website Header (Used in PublicLayout)
 * Features:
 * - Direct primary navigation: Home, Find Priests, My Bookings
 * - Swift Profile Avatar Dropdown Menu: Saved Addresses, Profile Settings, Logout
 * - Fully responsive with mobile drawer
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
      'transition-colors font-medium text-xs sm:text-sm flex items-center gap-1.5 py-1.5 px-3 rounded-md',
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

  const isDevotee = isAuthenticated && user?.role === 'USER';
  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="container flex h-16 items-center justify-between">
        {/* 1. Left: Brand Logo */}
        <Link
          to={isDevotee ? '/user/home' : '/'}
          className="flex items-center gap-2.5 font-bold text-xl text-foreground tracking-tight group select-none"
        >
          <PujaCircleLogo size={36} className="shadow-xs transition-transform group-hover:scale-105" />
          <span className="font-serif">
            Puja<span className="text-primary font-sans font-bold">Circle</span>
          </span>
        </Link>

        {/* 2. Center: Direct Fast Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          {isDevotee ? (
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
            </>
          ) : (
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

        {/* 3. Right: Profile Dropdown Menu & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isDevotee && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 h-9 rounded-lg border-border/80 shadow-xs hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <Avatar className="h-6 w-6 border border-primary/20 bg-primary/10">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="text-[11px] font-serif font-bold text-primary bg-primary/10">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="max-w-28 sm:max-w-36 truncate font-semibold text-xs text-foreground">
                    {user.name}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground opacity-60" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56 p-1.5 bg-card border-border shadow-lg rounded-lg">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-xs font-bold font-serif text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.phoneNumber || user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/60 my-1" />

                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={() => navigate('/user/addresses')}
                    className="flex items-center gap-2.5 text-xs py-2 px-2 cursor-pointer rounded-md focus:bg-muted"
                  >
                    <MapPin className="h-3.5 w-3.5 text-amber-600" />
                    <span>Saved Addresses</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => navigate('/user/profile')}
                    className="flex items-center gap-2.5 text-xs py-2 px-2 cursor-pointer rounded-md focus:bg-muted"
                  >
                    <User className="h-3.5 w-3.5 text-foreground" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-border/60 my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 text-xs py-2 px-2 text-destructive focus:bg-destructive/10 cursor-pointer rounded-md"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
            <SheetContent side="right" className="w-70 sm:w-80 flex flex-col justify-between p-6">
              <div className="space-y-6">
                <SheetHeader className="text-left border-b pb-4">
                  <SheetTitle className="flex items-center gap-2 font-serif text-lg">
                    <PujaCircleLogo size={28} className="shadow-xs" />
                    <span>Puja<span className="text-primary font-sans font-bold">Circle</span></span>
                  </SheetTitle>
                </SheetHeader>

                {/* Mobile Links */}
                <div className="flex flex-col space-y-1">
                  {isDevotee && user ? (
                    <>
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                      <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                {isDevotee ? (
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
