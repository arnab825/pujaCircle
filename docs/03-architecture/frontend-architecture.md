# Frontend Architecture Specification - PujaCircle 🕉️

## 1. Directory Organization & Clean Module Boundaries

```
frontend/src/
├── api/          # auth.api, user.api, address.api, priest.api, booking.api, admin.api
├── components/
│   ├── layout/   # PublicLayout.tsx, PriestLayout.tsx, AdminLayout.tsx, Header.tsx, Footer.tsx, PriestSidebar.tsx
│   ├── common/   # ProtectedRoute.tsx, PublicRouteGuard.tsx, GuestOnlyRoute.tsx, LoadingSpinner.tsx
│   ├── ui/       # shadcn/ui primitives
│   └── ...       # Domain components
├── mocks/        # db.ts (Single centralized mock database), delay.ts, mock-api.ts, test-mock-api.ts
├── pages/
│   ├── public/   # HomePage, AboutPage, ContactPage, RitualsPage, PriestListingPage, PriestDetailsPage
│   ├── auth/
│   │   ├── user/   # UserLoginPage, UserRegisterPage, UserForgotPasswordPage, UserResetPasswordPage, UserVerifyPhonePage, UserVerifyEmailPage
│   │   ├── priest/ # PriestLoginPage, PriestRegisterPage, PriestForgotPasswordPage, PriestResetPasswordPage, PriestVerifyPhonePage, PriestVerifyEmailPage
│   │   └── admin/  # AdminLoginPage (Private / Hidden)
│   ├── user/     # ProfilePage, AddressesPage, BookingsPage, BookingDetailsPage
│   ├── priest/   # PriestDashboardPage, PriestProfilePage, PriestAvailabilityPage, PriestBookingsPage
│   └── admin/    # AdminDashboardPage, AdminPriestsPage, AdminPriestDetailsPage, AdminUsersPage
├── routes/       # app-router.tsx
├── store/        # auth.store.ts, address.store.ts, booking.store.ts
└── types/        # auth.types.ts, user.types.ts, address.types.ts, priest.types.ts, booking.types.ts
```

---

## 2. Skeleton & Single Mock Data Source Model

- **RAFCE-style Skeletons**: Every page is structured as a clear React functional component with documented placeholders for future features.
- **Single Source of Truth (`@/mocks/db.ts`)**: All mock records (users, priests, rituals, addresses, slots, bookings, PIN codes, dashboard stats) reside in `@/mocks/db.ts`. No duplicate mock data exists inside page files.
- **Development Transition**:
  ```
  Page Skeleton -> Mock API Service -> Centralized Mock DB (@/mocks/db.ts)
                          ↓ (Future Backend Integration)
  Page Component -> API Service -> Express / Node Backend -> Database
  ```
