import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, User } from 'lucide-react';
import { PujaCircleLogo } from '@/components/common/PujaCircleLogo';
import { SacredBackground } from '@/components/common/SacredBackground';

export interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
}

export interface DashboardSidebarShellProps {
  navItems: NavItem[];
  workspaceLabel: string;
  topBarLabel: string;
  roleLabel: string;
  profilePath: string;
  logoutPath: string;
  children: React.ReactNode;
}

// Reusable Dashboard Sidebar Shell for Priest & Admin portals (Phase 3)
// Consolidates desktop sidebar, mobile drawer, sticky header, and layout scaffolding.
export const DashboardSidebarShell: React.FC<DashboardSidebarShellProps> = ({
  navItems,
  workspaceLabel,
  topBarLabel,
  roleLabel,
  profilePath,
  logoutPath,
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(logoutPath);
  };

  const isProfileActive = location.pathname.startsWith(profilePath);

  // Synchronize effective avatar URL from store or local persistence
  const avatarUrl = React.useMemo(() => {
    if (user?.avatarUrl) return user.avatarUrl;
    if (roleLabel === 'ADMIN' && user?.id) {
      return localStorage.getItem(`admin_avatar_${user.id}`) || null;
    }
    if (roleLabel === 'PRIEST' && user?.id) {
      return localStorage.getItem(`priest_avatar_${user.id}`) || null;
    }
    return null;
  }, [user?.avatarUrl, user?.id, roleLabel]);

  // Unified two-letter uppercase initials
  const userInitials = React.useMemo(() => {
    const name = user?.name?.trim();
    if (!name) return roleLabel === 'ADMIN' ? 'SR' : 'PU';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return roleLabel === 'ADMIN' ? 'SR' : 'PU';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + (parts[1] ? parts[1][0] : parts[parts.length - 1][0])).toUpperCase();
  }, [user?.name, roleLabel]);

  const fallbackBgClass = roleLabel === 'ADMIN' ? 'bg-[#450A0A]' : 'bg-[#780016]';

  // Helper to render navigation items
  const renderNavLinks = (onItemClick?: () => void) => {
    return (
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-amber-100/80 text-[#991B1B] font-bold shadow-2xs border-l-3 border-[#991B1B]'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/60'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-[#991B1B]' : 'text-stone-500'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    );
  };

  // Helper to render user profile footer
  const renderUserFooter = (onItemClick?: () => void) => {
    return (
      <div className="p-4 border-t border-[hsl(var(--border))] space-y-3 bg-white">
        <Link
          to={profilePath}
          onClick={onItemClick}
          className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
            isProfileActive
              ? 'bg-amber-100 text-[#991B1B]'
              : 'hover:bg-stone-100/70 text-stone-800'
          }`}
        >
          <Avatar className="h-9 w-9 border-2 border-white ring-2 ring-amber-400 bg-amber-100 shadow-xs shrink-0">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={user?.name || 'User'} className="object-cover" />
            ) : null}
            <AvatarFallback className={`${fallbackBgClass} text-white font-serif font-bold text-xs`}>
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-stone-900 truncate">
              {user?.name || 'Authorized User'}
            </p>
            <p className="text-[10px] text-stone-500 truncate">
              {user?.email || user?.phoneNumber || 'puja.circle'}
            </p>
          </div>
          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
        </Link>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="w-full justify-center gap-2 text-xs font-bold text-red-700 hover:text-red-800 hover:bg-red-50 border-red-200 h-9 rounded-md cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      <SacredBackground />

      
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 border-r border-[hsl(var(--border))] bg-white/95 text-stone-900 flex-col justify-between h-screen shadow-xs backdrop-blur-xs">
        <div className="flex-1 overflow-y-auto">
          
          <div className="h-16 border-b border-[hsl(var(--border))] flex items-center justify-between px-5 shrink-0 bg-white">
            <div className="flex items-center gap-2.5">
              <PujaCircleLogo size={28} className="shadow-2xs" />
              <div>
                <span className="font-serif font-black text-sm text-[#780016] tracking-tight">
                  Puja<span className="text-[#B45309] font-sans">Circle</span>
                </span>
                <span className="block text-[10px] text-stone-500 font-medium leading-none mt-0.5">
                  {workspaceLabel}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] uppercase font-bold border-amber-300 bg-amber-50 text-[#780016] px-1.5 py-0.5">
              {roleLabel}
            </Badge>
          </div>

          
          {renderNavLinks()}
        </div>

        
        {renderUserFooter()}
      </aside>

      
      <div className="md:pl-64 flex flex-col flex-1 min-w-0">
        
        <header className="sticky top-0 z-20 h-16 border-b border-[hsl(var(--border))] bg-white/90 backdrop-blur-xs px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="md:hidden p-2 rounded-md border border-[hsl(var(--border))] text-stone-700 hover:bg-stone-100"
                  aria-label="Open mobile menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 flex flex-col justify-between bg-white text-stone-900">
                <div className="flex-1 overflow-y-auto">
                  <div className="h-16 border-b border-[hsl(var(--border))] flex items-center justify-between pl-4 pr-12 shrink-0 bg-white">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PujaCircleLogo size={28} className="shrink-0" />
                      <div className="min-w-0">
                        <span className="font-serif font-bold text-sm text-[#780016] block leading-tight">
                          PujaCircle
                        </span>
                        <span className="block text-[10px] text-stone-500 leading-tight mt-0.5 truncate">
                          {workspaceLabel}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold border-amber-300 bg-amber-50 text-[#780016] px-1.5 py-0.5 shrink-0">
                      {roleLabel}
                    </Badge>
                  </div>
                  {renderNavLinks(() => setMobileOpen(false))}
                </div>
                {renderUserFooter(() => setMobileOpen(false))}
              </SheetContent>
            </Sheet>

            
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base font-bold text-stone-900">
                {topBarLabel}
              </span>
            </div>
          </div>

          
          <div className="flex items-center gap-3">
            <Link
              to={profilePath}
              className="hidden sm:flex items-center gap-2.5 text-xs font-semibold text-stone-700 hover:text-stone-950 transition-colors"
            >
              <Avatar className="h-8 w-8 border-2 border-white ring-2 ring-amber-400 bg-amber-100 shadow-xs shrink-0">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={user?.name || 'User'} className="object-cover" />
                ) : null}
                <AvatarFallback className={`${fallbackBgClass} text-white font-serif font-bold text-[11px]`}>
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-36 font-semibold">{user?.name || 'Account'}</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-md text-stone-500 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardSidebarShell;
