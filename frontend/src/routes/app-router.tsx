import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PriestLayout } from '@/components/layout/PriestLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PublicRouteGuard } from '@/components/common/PublicRouteGuard';
import { GuestOnlyRoute } from '@/components/common/GuestOnlyRoute';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Helper component for lazy-loaded route suspense
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

// Marketing & Public Pages (Lazy Loaded)
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));

// User Auth Pages (Lazy Loaded)
const UserLoginPage = lazy(() => import('@/pages/auth/user/UserLoginPage'));
const UserRegisterPage = lazy(() => import('@/pages/auth/user/UserRegisterPage'));
const UserForgotPasswordPage = lazy(() => import('@/pages/auth/user/UserForgotPasswordPage'));
const UserResetPasswordPage = lazy(() => import('@/pages/auth/user/UserResetPasswordPage'));
const UserVerifyPhonePage = lazy(() => import('@/pages/auth/user/UserVerifyPhonePage'));
const UserVerifyEmailPage = lazy(() => import('@/pages/auth/user/UserVerifyEmailPage'));

// Priest Auth Pages (Lazy Loaded)
const PriestLoginPage = lazy(() => import('@/pages/auth/priest/PriestLoginPage'));
const PriestRegisterPage = lazy(() => import('@/pages/auth/priest/PriestRegisterPage'));
const PriestForgotPasswordPage = lazy(() => import('@/pages/auth/priest/PriestForgotPasswordPage'));
const PriestResetPasswordPage = lazy(() => import('@/pages/auth/priest/PriestResetPasswordPage'));
const PriestVerifyPhonePage = lazy(() => import('@/pages/auth/priest/PriestVerifyPhonePage'));
const PriestVerifyEmailPage = lazy(() => import('@/pages/auth/priest/PriestVerifyEmailPage'));

// Admin Auth Page (Lazy Loaded)
const AdminLoginPage = lazy(() => import('@/pages/auth/admin/AdminLoginPage'));

// Customer Features (Lazy Loaded)
const RitualsPage = lazy(() => import('@/pages/public/RitualsPage'));
const PriestListingPage = lazy(() => import('@/pages/public/PriestListingPage'));
const PriestDetailsPage = lazy(() => import('@/pages/public/PriestDetailsPage'));
const ProfilePage = lazy(() => import('@/pages/user/ProfilePage'));
const AddressesPage = lazy(() => import('@/pages/user/AddressesPage'));
const BookingsPage = lazy(() => import('@/pages/user/BookingsPage'));
const BookingDetailsPage = lazy(() => import('@/pages/user/BookingDetailsPage'));

// Priest Workspace (Lazy Loaded)
const PriestDashboardPage = lazy(() => import('@/pages/priest/PriestDashboardPage'));
const PriestProfilePage = lazy(() => import('@/pages/priest/PriestProfilePage'));
const PriestAvailabilityPage = lazy(() => import('@/pages/priest/PriestAvailabilityPage'));
const PriestBookingsPage = lazy(() => import('@/pages/priest/PriestBookingsPage'));

// Admin Workspace (Lazy Loaded)
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminPriestsPage = lazy(() => import('@/pages/admin/AdminPriestsPage'));
const AdminPriestDetailsPage = lazy(() => import('@/pages/admin/AdminPriestDetailsPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'));

export const appRouter = createBrowserRouter([
  // ==========================================
  // 1. PUBLIC WEBSITE & CONSUMER EXPERIENCE
  // ==========================================
  {
    path: '/',
    element: (
      <PublicRouteGuard>
        <PublicLayout />
      </PublicRouteGuard>
    ),
    children: [
      // Marketing
      { index: true, element: <GuestOnlyRoute>{LazyPage(HomePage)}</GuestOnlyRoute> },
      { path: 'about', element: <GuestOnlyRoute>{LazyPage(AboutPage)}</GuestOnlyRoute> },
      { path: 'contact', element: <GuestOnlyRoute>{LazyPage(ContactPage)}</GuestOnlyRoute> },

      // Legacy & Convenience Auth Redirects
      { path: 'login', element: <Navigate to="/auth/user/login" replace /> },
      { path: 'register', element: <Navigate to="/auth/user/register" replace /> },
      { path: 'auth/login', element: <Navigate to="/auth/user/login" replace /> },
      { path: 'auth/register', element: <Navigate to="/auth/user/register" replace /> },
      { path: 'forgot-password', element: <Navigate to="/auth/user/forgot-password" replace /> },
      { path: 'reset-password', element: <Navigate to="/auth/user/reset-password" replace /> },
      { path: 'verify-otp', element: <Navigate to="/auth/user/verify-phone" replace /> },

      // Devotee Auth Routes
      { path: 'auth/user/login', element: <GuestOnlyRoute>{LazyPage(UserLoginPage)}</GuestOnlyRoute> },
      { path: 'auth/user/register', element: <GuestOnlyRoute>{LazyPage(UserRegisterPage)}</GuestOnlyRoute> },
      { path: 'auth/user/verify-phone', element: <GuestOnlyRoute>{LazyPage(UserVerifyPhonePage)}</GuestOnlyRoute> },
      { path: 'auth/user/verify-email', element: <GuestOnlyRoute>{LazyPage(UserVerifyEmailPage)}</GuestOnlyRoute> },
      { path: 'auth/user/forgot-password', element: <GuestOnlyRoute>{LazyPage(UserForgotPasswordPage)}</GuestOnlyRoute> },
      { path: 'auth/user/reset-password', element: <GuestOnlyRoute>{LazyPage(UserResetPasswordPage)}</GuestOnlyRoute> },

      // Priest Auth Routes
      { path: 'auth/priest/login', element: <GuestOnlyRoute>{LazyPage(PriestLoginPage)}</GuestOnlyRoute> },
      { path: 'auth/priest/register', element: <GuestOnlyRoute>{LazyPage(PriestRegisterPage)}</GuestOnlyRoute> },
      { path: 'auth/priest/verify-phone', element: <GuestOnlyRoute>{LazyPage(PriestVerifyPhonePage)}</GuestOnlyRoute> },
      { path: 'auth/priest/verify-email', element: <GuestOnlyRoute>{LazyPage(PriestVerifyEmailPage)}</GuestOnlyRoute> },
      { path: 'auth/priest/forgot-password', element: <GuestOnlyRoute>{LazyPage(PriestForgotPasswordPage)}</GuestOnlyRoute> },
      { path: 'auth/priest/reset-password', element: <GuestOnlyRoute>{LazyPage(PriestResetPasswordPage)}</GuestOnlyRoute> },

      // Admin Auth Route
      { path: 'auth/admin/login', element: <GuestOnlyRoute>{LazyPage(AdminLoginPage)}</GuestOnlyRoute> },

      // Devotee Customer Features (USER Role Only)
      { path: 'rituals', element: <ProtectedRoute allowedRoles={['USER']}>{LazyPage(RitualsPage)}</ProtectedRoute> },
      { path: 'priests', element: <ProtectedRoute allowedRoles={['USER']}>{LazyPage(PriestListingPage)}</ProtectedRoute> },
      { path: 'priests/:id', element: <ProtectedRoute allowedRoles={['USER']}>{LazyPage(PriestDetailsPage)}</ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute allowedRoles={['USER']}>{LazyPage(ProfilePage)}</ProtectedRoute> },
      { path: 'user/profile', element: <Navigate to="/profile" replace /> },
      { path: 'addresses', element: <ProtectedRoute allowedRoles={['USER']}>{LazyPage(AddressesPage)}</ProtectedRoute> },
      { path: 'user/addresses', element: <Navigate to="/addresses" replace /> },
      { path: 'bookings', element: <ProtectedRoute allowedRoles={['USER']}>{LazyPage(BookingsPage)}</ProtectedRoute> },
      { path: 'user/bookings', element: <Navigate to="/bookings" replace /> },
      { path: 'bookings/:id', element: <ProtectedRoute allowedRoles={['USER']}>{LazyPage(BookingDetailsPage)}</ProtectedRoute> },
      { path: 'user/bookings/:id', element: <Navigate to="/bookings/:id" replace /> },
    ],
  },

  // ==========================================
  // 2. PRIEST WORKSPACE (PRIEST Role Only)
  // ==========================================
  {
    path: '/priest',
    element: (
      <ProtectedRoute allowedRoles={['PRIEST']}>
        <PriestLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/priest/dashboard" replace /> },
      { path: 'dashboard', element: LazyPage(PriestDashboardPage) },
      { path: 'profile', element: LazyPage(PriestProfilePage) },
      { path: 'availability', element: LazyPage(PriestAvailabilityPage) },
      { path: 'bookings', element: LazyPage(PriestBookingsPage) },
      { path: 'bookings/:id', element: LazyPage(PriestBookingsPage) },
    ],
  },

  // ==========================================
  // 3. ADMIN WORKSPACE (ADMIN Role Only)
  // ==========================================
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: LazyPage(AdminDashboardPage) },
      { path: 'priests', element: LazyPage(AdminPriestsPage) },
      { path: 'priests/:id', element: LazyPage(AdminPriestDetailsPage) },
      { path: 'users', element: LazyPage(AdminUsersPage) },
      { path: 'profile', element: LazyPage(AdminProfilePage) },
    ],
  },

  // Catch-all route
  { path: '*', element: <Navigate to="/" replace /> },
]);
