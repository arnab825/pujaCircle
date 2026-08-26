import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import {
  Sparkles,
  LayoutDashboard,
  Calendar,
  Clock,
  UserCheck,
  LogOut,
  IndianRupee,
} from "lucide-react";

/**
 * PriestLayout
 * Dedicated workspace layout for Purohits (PRIEST role).
 * Features a priest sidebar, top bar with priest badge, and main content area.
 */
export const PriestLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/priest/login");
  };

  const navItems = [
    { label: "Dashboard", path: "/priest/dashboard", icon: LayoutDashboard },
    { label: "Services & Prices", path: "/priest/services", icon: IndianRupee },
    { label: "Availability Slots", path: "/priest/availability", icon: Clock },
    { label: "Appointments Log", path: "/priest/bookings", icon: Calendar },
    { label: "Purohit Profile", path: "/priest/profile", icon: UserCheck },
  ];

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Priest Sidebar */}
      <aside className="w-64 border-r bg-card flex-col justify-between hidden md:flex">
        <div>
          {/* Workspace Branding */}
          <div className="h-16 border-b flex items-center gap-2 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-foreground font-serif">
                PujaCircle
              </span>
              <p className="text-[10px] uppercase font-semibold text-primary font-sans">
                Purohit Workspace
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 text-sm font-medium ${
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer User Info & Logout */}
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground truncate max-w-32.5">
                {user?.name}
              </p>
              <p className="text-[11px] text-muted-foreground">{user?.email || user?.phoneNumber}</p>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase">
              PRIEST
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs text-muted-foreground hover:text-destructive gap-2"
            onClick={handleLogout}
          >
            <LogOut className="h-3.5 w-3.5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Purohit Portal
            </span>
            <Badge
              variant="outline"
              className="text-[10px] text-primary border-primary/40"
            >
              Verified Scholar
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.phoneNumber || user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-xs gap-1.5"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default PriestLayout;
