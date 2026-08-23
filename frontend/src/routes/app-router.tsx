import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import PriestListingPage from '@/pages/public/PriestListingPage';
import PriestDetailsPage from '@/pages/public/PriestDetailsPage';
import RitualsPage from '@/pages/public/RitualsPage';
import AboutPage from '@/pages/public/AboutPage';
import ContactPage from '@/pages/public/ContactPage';

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// User Pages
import UserDashboardPage from '@/pages/user/UserDashboardPage';
import ProfilePage from '@/pages/user/ProfilePage';
import AddressesPage from '@/pages/user/AddressesPage';
import BookingsPage from '@/pages/user/BookingsPage';
import BookingDetailsPage from '@/pages/user/BookingDetailsPage';

// Priest Pages
import PriestDashboardPage from '@/pages/priest/PriestDashboardPage';
import PriestProfilePage from '@/pages/priest/PriestProfilePage';
import PriestAvailabilityPage from '@/pages/priest/PriestAvailabilityPage';
import PriestBookingsPage from '@/pages/priest/PriestBookingsPage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import PriestApprovalPage from '@/pages/admin/PriestApprovalPage';
import PriestApprovalDetailsPage from '@/pages/admin/PriestApprovalDetailsPage';

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public Routes
      { index: true, element: <HomePage /> },
      { path: 'priests', element: <PriestListingPage /> },
      { path: 'priests/:id', element: <PriestDetailsPage /> },
      { path: 'rituals', element: <RitualsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },

      // Auth Routes
      { path: 'auth/login', element: <LoginPage /> },
      { path: 'auth/register', element: <RegisterPage /> },
      { path: 'auth/verify-otp', element: <VerifyOtpPage /> },
      { path: 'auth/forgot-password', element: <ForgotPasswordPage /> },
      { path: 'auth/reset-password', element: <ResetPasswordPage /> },

      // User Routes
      { path: 'user/dashboard', element: <UserDashboardPage /> },
      { path: 'user/profile', element: <ProfilePage /> },
      { path: 'user/addresses', element: <AddressesPage /> },
      { path: 'user/bookings', element: <BookingsPage /> },
      { path: 'user/bookings/:id', element: <BookingDetailsPage /> },

      // Priest Portal Routes
      { path: 'priest/dashboard', element: <PriestDashboardPage /> },
      { path: 'priest/profile', element: <PriestProfilePage /> },
      { path: 'priest/availability', element: <PriestAvailabilityPage /> },
      { path: 'priest/bookings', element: <PriestBookingsPage /> },

      // Admin Portal Routes
      { path: 'admin/dashboard', element: <AdminDashboardPage /> },
      { path: 'admin/priest-approvals', element: <PriestApprovalPage /> },
      { path: 'admin/priest-approvals/:id', element: <PriestApprovalDetailsPage /> },

      // Catch-all
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
