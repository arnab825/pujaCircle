import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { PriestLayout } from '@/components/layout/PriestLayout';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { PublicRouteGuard } from '@/components/common/PublicRouteGuard';
import { GuestOnlyRoute } from '@/components/common/GuestOnlyRoute';

// Marketing & Public Pages
import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';

// User Auth Pages
import UserLoginPage from '@/pages/auth/user/UserLoginPage';
import UserRegisterPage from '@/pages/auth/user/UserRegisterPage';
import UserForgotPasswordPage from '@/pages/auth/user/UserForgotPasswordPage';
import UserResetPasswordPage from '@/pages/auth/user/UserResetPasswordPage';
import UserVerifyPhonePage from '@/pages/auth/user/UserVerifyPhonePage';
import UserVerifyEmailPage from '@/pages/auth/user/UserVerifyEmailPage';

// Priest Auth Pages
import PriestLoginPage from '@/pages/auth/priest/PriestLoginPage';
import PriestRegisterPage from '@/pages/auth/priest/PriestRegisterPage';
import PriestForgotPasswordPage from '@/pages/auth/priest/PriestForgotPasswordPage';
import PriestResetPasswordPage from '@/pages/auth/priest/PriestResetPasswordPage';
import PriestVerifyPhonePage from '@/pages/auth/priest/PriestVerifyPhonePage';
import PriestVerifyEmailPage from '@/pages/auth/priest/PriestVerifyEmailPage';

// Admin Auth Page (Private / Hidden)
import AdminLoginPage from '@/pages/auth/admin/AdminLoginPage';

// Authenticated Customer Pages (USER Role Only)
import RitualsPage from '@/pages/public/RitualsPage';
import PriestListingPage from '@/pages/public/PriestListingPage';
import PriestDetailsPage from '@/pages/public/PriestDetailsPage';
import ProfilePage from '@/pages/user/ProfilePage';
import AddressesPage from '@/pages/user/AddressesPage';
import BookingsPage from '@/pages/user/BookingsPage';
import BookingDetailsPage from '@/pages/user/BookingDetailsPage';

// Priest Workspace Pages (PRIEST Role Only)
import PriestDashboardPage from '@/pages/priest/PriestDashboardPage';
import PriestProfilePage from '@/pages/priest/PriestProfilePage';
import PriestAvailabilityPage from '@/pages/priest/PriestAvailabilityPage';
import PriestBookingsPage from '@/pages/priest/PriestBookingsPage';

// Admin Workspace Pages (ADMIN Role Only)
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminPriestsPage from '@/pages/admin/AdminPriestsPage';
import AdminPriestDetailsPage from '@/pages/admin/AdminPriestDetailsPage';
import AdminUsersPage from '@/pages/admin/AdminUsersPage';

export const appRouter = createBrowserRouter([
  // ==========================================
  // 1. PUBLIC WEBSITE & CONSUMER EXPERIENCE (PublicLayout)
  // Protected from PRIEST and ADMIN workspaces
  // ==========================================
  {
    path: '/',
    element: (
      <PublicRouteGuard>
        <PublicLayout />
      </PublicRouteGuard>
    ),
    children: [
      // Marketing Information Routes (Unauthenticated + USER)
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },

      // Legacy/Root auth aliases redirecting to user auth
      { path: 'login', element: <Navigate to="/auth/user/login" replace /> },
      { path: 'register', element: <Navigate to="/auth/user/register" replace /> },
      { path: 'auth/login', element: <Navigate to="/auth/user/login" replace /> },
      { path: 'auth/register', element: <Navigate to="/auth/user/register" replace /> },
      { path: 'forgot-password', element: <Navigate to="/auth/user/forgot-password" replace /> },
      { path: 'reset-password', element: <Navigate to="/auth/user/reset-password" replace /> },
      { path: 'verify-otp', element: <Navigate to="/auth/user/verify-phone" replace /> },

      // ==========================================
      // USER AUTHENTICATION ROUTES (/auth/user/*)
      // ==========================================
      {
        path: 'auth/user/login',
        element: (
          <GuestOnlyRoute>
            <UserLoginPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/user/register',
        element: (
          <GuestOnlyRoute>
            <UserRegisterPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/user/verify-phone',
        element: (
          <GuestOnlyRoute>
            <UserVerifyPhonePage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/user/verify-email',
        element: (
          <GuestOnlyRoute>
            <UserVerifyEmailPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/user/forgot-password',
        element: (
          <GuestOnlyRoute>
            <UserForgotPasswordPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/user/reset-password',
        element: (
          <GuestOnlyRoute>
            <UserResetPasswordPage />
          </GuestOnlyRoute>
        ),
      },

      // ==========================================
      // PRIEST AUTHENTICATION ROUTES (/auth/priest/*)
      // ==========================================
      {
        path: 'auth/priest/login',
        element: (
          <GuestOnlyRoute>
            <PriestLoginPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/priest/register',
        element: (
          <GuestOnlyRoute>
            <PriestRegisterPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/priest/verify-phone',
        element: (
          <GuestOnlyRoute>
            <PriestVerifyPhonePage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/priest/verify-email',
        element: (
          <GuestOnlyRoute>
            <PriestVerifyEmailPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/priest/forgot-password',
        element: (
          <GuestOnlyRoute>
            <PriestForgotPasswordPage />
          </GuestOnlyRoute>
        ),
      },
      {
        path: 'auth/priest/reset-password',
        element: (
          <GuestOnlyRoute>
            <PriestResetPasswordPage />
          </GuestOnlyRoute>
        ),
      },

      // ==========================================
      // ADMIN AUTHENTICATION ROUTE (/auth/admin/login)
      // (Private / Hidden Console Login)
      // ==========================================
      {
        path: 'auth/admin/login',
        element: (
          <GuestOnlyRoute>
            <AdminLoginPage />
          </GuestOnlyRoute>
        ),
      },

      // ==========================================
      // CUSTOMER-ONLY FEATURES (USER Role Only)
      // ==========================================
      {
        path: 'rituals',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <RitualsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'priests',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <PriestListingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'priests/:id',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <PriestDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'user/profile',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'addresses',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <AddressesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'user/addresses',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <AddressesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bookings',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <BookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'user/bookings',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <BookingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'bookings/:id',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <BookingDetailsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'user/bookings/:id',
        element: (
          <ProtectedRoute allowedRoles={['USER']}>
            <BookingDetailsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // ==========================================
  // 2. PRIEST WORKSPACE (PriestLayout)
  // Protected strictly for PRIEST role
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
      { path: 'dashboard', element: <PriestDashboardPage /> },
      { path: 'profile', element: <PriestProfilePage /> },
      { path: 'availability', element: <PriestAvailabilityPage /> },
      { path: 'bookings', element: <PriestBookingsPage /> },
      { path: 'bookings/:id', element: <PriestBookingsPage /> },
    ],
  },

  // ==========================================
  // 3. ADMIN WORKSPACE (AdminLayout)
  // Protected strictly for ADMIN role
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
      { path: 'dashboard', element: <AdminDashboardPage /> },
      { path: 'priests', element: <AdminPriestsPage /> },
      { path: 'priests/:id', element: <AdminPriestDetailsPage /> },
      { path: 'users', element: <AdminUsersPage /> },
    ],
  },

  // Catch-all route -> redirect to root (PublicRouteGuard will route to role-appropriate home)
  { path: '*', element: <Navigate to="/" replace /> },
]);
