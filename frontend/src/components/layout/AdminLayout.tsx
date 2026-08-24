import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { ShieldAlert, LayoutDashboard, Users, Flame, LogOut, User } from "lucide-react";

/**
 * AdminLayout
 * Dedicated workspace layout for Platform Administrators (ADMIN role).
 * Features an administrative sidebar, top bar with admin badge, and review workspace.
 */
export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/auth/user/login");
  };

  const navItems = [
    {
      label: "Admin Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Manage Priests",
      path: "/admin/priests",
      icon: Flame,
    },
    {
      label: "Registered Devotees",
      path: "/admin/users",
      icon: Users,
    },
  ];

  const isProfileActive = location.pathname.startsWith("/admin/profile");

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r bg-card flex-col justify-between hidden md:flex">
        <div>
          {/* Workspace Branding */}
          <div className="h-16 border-b flex items-center gap-2 px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground shadow-sm">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-sm text-brand-maroon">
                PujaCircle
              </span>
              <p className="text-[10px] uppercase font-semibold text-destructive">
                Platform Admin
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 text-sm font-medium ${isActive
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
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

        {/* Sidebar Footer User Info & Profile / Logout Actions */}
        <div className="p-4 border-t space-y-3">
          {/* Clickable Admin User Profile Card */}
          <Link
            to="/admin/profile"
            className={`flex items-center justify-between p-2 rounded-lg transition-colors border group ${isProfileActive
              ? "bg-destructive/10 border-destructive/30"
              : "hover:bg-muted/50 border-transparent hover:border-border/60"
              }`}
            title="Click to view & edit Admin Profile"
          >
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold text-foreground group-hover:text-destructive transition-colors truncate">
                {user?.name || "PujaCircle Admin"}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || "admin@pujacircle.demo"}</p>
            </div>
            <Badge variant="destructive" className="text-[10px] uppercase shrink-0">
              ADMIN
            </Badge>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link to="/admin/profile">
              <Button
                variant={isProfileActive ? "ghost" : "outline"}
                size="sm"
                className={`w-full text-xs gap-1.5 px-2 ${isProfileActive ? "text-destructive font-bold" : "text-muted-foreground"
                  }`}
              >
                <User className="h-3.5 w-3.5" /> Profile
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-destructive gap-1.5 px-2"
              onClick={handleLogout}
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Administration Console
            </span>
            <Badge
              variant="outline"
              className="text-[10px] text-destructive border-destructive/40"
            >
              Internal Ops
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/profile"
              className="text-xs text-muted-foreground hover:text-foreground hover:underline flex items-center gap-1.5 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="hidden sm:inline font-medium">{user?.name || user?.email}</span>
            </Link>
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

export default AdminLayout;
