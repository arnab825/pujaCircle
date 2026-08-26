import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PriestLayout } from '@/components/layout/PriestLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import {
  UserRouteGuard,
  PriestRouteGuard,
  AdminRouteGuard,
} from '@/components/common/RoleRouteGuard';
import { PublicRouteGuard } from '@/components/common/PublicRouteGuard';
import { GuestOnlyRoute } from '@/components/common/GuestOnlyRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

const LazyPage = (Component: React.ComponentType) => (
  <Suspense
    fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="md" label="Loading..." />
      </div>
    }
  >
    <Component />
  </Suspense>
);

// Marketing & Public Pages (Lazy)
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));

// User Auth Pages
const UserLoginPage = lazy(() => import('@/pages/auth/user/UserLoginPage'));
const UserRegisterPage = lazy(() => import('@/pages/auth/user/UserRegisterPage'));
const UserForgotPasswordPage = lazy(() => import('@/pages/auth/user/UserForgotPasswordPage'));
const UserResetPasswordPage = lazy(() => import('@/pages/auth/user/UserResetPasswordPage'));
const UserVerifyPhonePage = lazy(() => import('@/pages/auth/user/UserVerifyPhonePage'));
const UserVerifyEmailPage = lazy(() => import('@/pages/auth/user/UserVerifyEmailPage'));

// Priest Auth Pages
const PriestLoginPage = lazy(() => import('@/pages/auth/priest/PriestLoginPage'));
const PriestRegisterPage = lazy(() => import('@/pages/auth/priest/PriestRegisterPage'));
const PriestForgotPasswordPage = lazy(() => import('@/pages/auth/priest/PriestForgotPasswordPage'));
const PriestResetPasswordPage = lazy(() => import('@/pages/auth/priest/PriestResetPasswordPage'));
const PriestVerifyPhonePage = lazy(() => import('@/pages/auth/priest/PriestVerifyPhonePage'));
const PriestVerifyEmailPage = lazy(() => import('@/pages/auth/priest/PriestVerifyEmailPage'));

// Admin Auth Page
const AdminLoginPage = lazy(() => import('@/pages/auth/admin/AdminLoginPage'));

// Devotee Pages
const UserHomePage = lazy(() => import('@/pages/user/UserHomePage'));
const PriestListingPage = lazy(() => import('@/pages/public/PriestListingPage'));
const PriestDetailsPage = lazy(() => import('@/pages/public/PriestDetailsPage'));
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'));
const AddressesPage = lazy(() => import('@/pages/user/AddressesPage'));
const BookingsPage = lazy(() => import('@/pages/user/BookingsPage'));
const BookingDetailsPage = lazy(() => import('@/pages/user/BookingDetailsPage'));

// Priest Workspace Pages
const PriestDashboardPage = lazy(() => import('@/pages/priest/PriestDashboardPage'));
const PriestServicesPage = lazy(() => import('@/pages/priest/PriestServicesPage'));
const PriestAvailabilityPage = lazy(() => import('@/pages/priest/PriestAvailabilityPage'));
const PriestBookingsPage = lazy(() => import('@/pages/priest/PriestBookingsPage'));
const PriestProfilePage = lazy(() => import('@/pages/priest/PriestProfilePage'));
const PriestPendingApprovalPage = lazy(() => import('@/pages/priest/PriestPendingApprovalPage'));

// Admin Workspace Pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminPriestsPage = lazy(() => import('@/pages/admin/AdminPriestsPage'));
const AdminPriestDetailsPage = lazy(() => import('@/pages/admin/AdminPriestDetailsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'));

export const appRouter = createBrowserRouter([
  // ==========================================
  // 1. PUBLIC WEBSITE & DEVOTEE (USER) PORTAL
  // ==========================================
  {
    path: '/',
    element: (
      <PublicRouteGuard>
        <PublicLayout />
      </PublicRouteGuard>
    ),
    children: [
      // Public Marketing
      { index: true, element: <GuestOnlyRoute>{LazyPage(HomePage)}</GuestOnlyRoute> },
      { path: 'about', element: <GuestOnlyRoute>{LazyPage(AboutPage)}</GuestOnlyRoute> },
      { path: 'contact', element: <GuestOnlyRoute>{LazyPage(ContactPage)}</GuestOnlyRoute> },

      // Guest Auth Routes
      { path: 'user/login', element: <GuestOnlyRoute>{LazyPage(UserLoginPage)}</GuestOnlyRoute> },
      { path: 'user/register', element: <GuestOnlyRoute>{LazyPage(UserRegisterPage)}</GuestOnlyRoute> },
      { path: 'user/forgot-password', element: <GuestOnlyRoute>{LazyPage(UserForgotPasswordPage)}</GuestOnlyRoute> },
      { path: 'user/reset-password', element: <GuestOnlyRoute>{LazyPage(UserResetPasswordPage)}</GuestOnlyRoute> },
      { path: 'user/verify-phone', element: <GuestOnlyRoute>{LazyPage(UserVerifyPhonePage)}</GuestOnlyRoute> },
      { path: 'user/verify-email', element: <GuestOnlyRoute>{LazyPage(UserVerifyEmailPage)}</GuestOnlyRoute> },

      { path: 'priest/login', element: <GuestOnlyRoute>{LazyPage(PriestLoginPage)}</GuestOnlyRoute> },
      { path: 'priest/register', element: <GuestOnlyRoute>{LazyPage(PriestRegisterPage)}</GuestOnlyRoute> },
      { path: 'priest/forgot-password', element: <GuestOnlyRoute>{LazyPage(PriestForgotPasswordPage)}</GuestOnlyRoute> },
      { path: 'priest/reset-password', element: <GuestOnlyRoute>{LazyPage(PriestResetPasswordPage)}</GuestOnlyRoute> },
      { path: 'priest/verify-phone', element: <GuestOnlyRoute>{LazyPage(PriestVerifyPhonePage)}</GuestOnlyRoute> },
      { path: 'priest/verify-email', element: <GuestOnlyRoute>{LazyPage(PriestVerifyEmailPage)}</GuestOnlyRoute> },

      { path: 'admin/login', element: <GuestOnlyRoute>{LazyPage(AdminLoginPage)}</GuestOnlyRoute> },

      // Legacy /auth/* aliases
      { path: 'auth/user/login', element: <Navigate to="/user/login" replace /> },
      { path: 'auth/user/register', element: <Navigate to="/user/register" replace /> },
      { path: 'auth/user/forgot-password', element: <Navigate to="/user/forgot-password" replace /> },
      { path: 'auth/user/reset-password', element: <Navigate to="/user/reset-password" replace /> },
      { path: 'auth/priest/login', element: <Navigate to="/priest/login" replace /> },
      { path: 'auth/priest/register', element: <Navigate to="/priest/register" replace /> },
      { path: 'auth/admin/login', element: <Navigate to="/admin/login" replace /> },
      { path: 'login', element: <Navigate to="/user/login" replace /> },
      { path: 'register', element: <Navigate to="/user/register" replace /> },

      // Canonical Devotee Features (USER Role Only)
      { path: 'user/home', element: <UserRouteGuard>{LazyPage(UserHomePage)}</UserRouteGuard> },
      { path: 'user/priests', element: <UserRouteGuard>{LazyPage(PriestListingPage)}</UserRouteGuard> },
      { path: 'user/priests/:id', element: <UserRouteGuard>{LazyPage(PriestDetailsPage)}</UserRouteGuard> },
      { path: 'user/bookings', element: <UserRouteGuard>{LazyPage(BookingsPage)}</UserRouteGuard> },
      { path: 'user/bookings/:id', element: <UserRouteGuard>{LazyPage(BookingDetailsPage)}</UserRouteGuard> },
      { path: 'user/addresses', element: <UserRouteGuard>{LazyPage(AddressesPage)}</UserRouteGuard> },
      { path: 'user/profile', element: <UserRouteGuard>{LazyPage(ProfilePage)}</UserRouteGuard> },

      // Backward-Compatible Redirects
      { path: 'rituals', element: <Navigate to="/user/priests" replace /> },
      { path: 'priests', element: <Navigate to="/user/priests" replace /> },
      { path: 'bookings', element: <Navigate to="/user/bookings" replace /> },
      { path: 'addresses', element: <Navigate to="/user/addresses" replace /> },
      { path: 'profile', element: <Navigate to="/user/profile" replace /> },
    ],
  },

  // ==========================================
  // 2. PRIEST WORKSPACE (PRIEST Role Only)
  // ==========================================
  {
    path: '/priest',
    element: (
      <PriestRouteGuard>
        <PriestLayout />
      </PriestRouteGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/priest/dashboard" replace /> },
      { path: 'dashboard', element: LazyPage(PriestDashboardPage) },
      { path: 'services', element: LazyPage(PriestServicesPage) },
      { path: 'availability', element: LazyPage(PriestAvailabilityPage) },
      { path: 'bookings', element: LazyPage(PriestBookingsPage) },
      { path: 'bookings/:id', element: LazyPage(PriestBookingsPage) },
      { path: 'upcoming', element: <Navigate to="/priest/bookings" replace /> },
      { path: 'completed', element: <Navigate to="/priest/bookings" replace /> },
      { path: 'rejected', element: <Navigate to="/priest/bookings" replace /> },
      { path: 'profile', element: LazyPage(PriestProfilePage) },
      { path: 'pending-approval', element: LazyPage(PriestPendingApprovalPage) },
    ],
  },

  // ==========================================
  // 3. ADMIN WORKSPACE (ADMIN Role Only)
  // ==========================================
  {
    path: '/admin',
    element: (
      <AdminRouteGuard>
        <AdminLayout />
      </AdminRouteGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: LazyPage(AdminDashboardPage) },
      { path: 'priests', element: LazyPage(AdminPriestsPage) },
      { path: 'priests/pending', element: LazyPage(AdminPriestsPage) },
      { path: 'priests/:id', element: LazyPage(AdminPriestDetailsPage) },
      { path: 'users', element: LazyPage(AdminUsersPage) },
      { path: 'bookings', element: LazyPage(AdminDashboardPage) },
      { path: 'profile', element: LazyPage(AdminProfilePage) },
    ],
  },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
