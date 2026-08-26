# Frontend Architecture Specification - PujaCircle 🕉️

Welcome to the **Frontend Architecture Guide** for PujaCircle. This document explains how the React frontend is organized, how data flows between stores and APIs, and how routing boundaries are enforced.

---

## 1. High-Level Technology Stack

- **React 19 + TypeScript**: Modern React functional components with explicit typing.
- **Vite 6**: Fast bundling, instant Hot Module Replacement (HMR).
- **Tailwind CSS v4**: Utility-first CSS using semantic design tokens defined in `src/index.css`.
- **shadcn/ui + Radix UI**: Accessible, robust headless UI primitives (Dialogs, Dropdowns, Tabs, Tooltips, Cards).
- **Zustand 5**: Minimalist, readable client state management without boilerplate reducers.
- **Zod 3**: Strict schema validation for forms and API payloads.
- **Sonner**: Toast notification system.

---

## 2. Routing & Experience Boundaries

The application uses **React Router v7** with role-isolated boundaries managed by `src/routes/app-router.tsx` and `src/components/common/RoleRouteGuard.tsx`:

```text
[ Public & Marketing (Guests) ]
  ├── Landing Page (/)
  ├── About Us (/about)
  ├── Contact Us (/contact)
  └── Auth Portals (/user/login, /priest/login, /admin/login, register & recovery)

[ Authenticated Devotee (USER Role) ]
  ├── Devotee Home (/user/home)
  ├── Priest Discovery & Search (/user/priests)
  ├── Priest Profile & Booking Wizard (/user/priests/:id)
  ├── My Bookings (/user/bookings)
  ├── Booking Details & Ratings (/user/bookings/:id)
  ├── Saved Addresses (/user/addresses)
  └── Devotee Profile (/user/profile)

[ Authenticated Purohit (PRIEST Role) ]
  ├── Operational Dashboard (/priest/dashboard)
  ├── Services & Custom Dakshina (/priest/services)
  ├── Availability & Muhurat Slots (/priest/availability)
  ├── Appointment Management (/priest/bookings)
  ├── Purohit Profile (/priest/profile)
  └── Pending Review Screen (/priest/pending-approval)

[ Authenticated Administrator (ADMIN Role) ]
  ├── Platform Metric Dashboard (/admin/dashboard)
  ├── Purohit Verification & Roster (/admin/priests & /admin/priests/:id)
  ├── Devotee Account Directory (/admin/users)
  └── Admin Profile (/admin/profile)
```

---

## 3. State Management (Zustand Stores)

State management is kept deliberately simple and flat for beginner comprehension:

### 1. `useAuthStore` (`src/store/auth.store.ts`)
- Manages current user session (`user: AuthUser | null`), authentication status, and token persistence in `localStorage`.
- Actions: `login(credentials)`, `logout()`, `setUser(user)`.

### 2. `useBookingStore` (`src/store/booking.store.ts`)
- Manages the active multi-step booking draft (`priestId`, `ritualId`, `addressId`, `slotId`, `bookingDate`).
- Actions: `setDraft(partial)`, `resetDraft()`, `openBookingModal()`, `closeBookingModal()`.

### 3. `useAddressStore` (`src/store/address.store.ts`)
- Manages the currently selected ritual address and address modal dialog open/edit states.
- Actions: `setSelectedAddressId(id)`, `openAddressModal(address)`, `closeAddressModal()`.

---

## 4. API & Mock Layer Architecture

```text
UI Component ──► API Client (src/api/) ──► Mock API Layer (src/mocks/) ──► Mock Database (src/mocks/db.ts)
```

1. **API Client (`src/api/*.api.ts`)**:
   - Clean async/await wrappers with centralized error handling via `logAppError` and `getUserFriendlyErrorMessage`.
   - When backend is connected, `apiClient` (`axios`) seamlessly points to `VITE_API_BASE_URL`.

2. **Mock API Layer (`src/mocks/mock-api.ts`)**:
   - Emulates real network delays (`delay(200)`).
   - Validates all incoming payloads strictly using Zod schemas (`safeParse`).
   - Rejects invalid data with descriptive operational error messages.

3. **Deterministic Mock DB (`src/mocks/db.ts`)**:
   - In-memory database seeded with realistic Purohits, rituals, addresses, and bookings.
   - Includes reset functions (`resetMockDb()`) used by test suites.

---

## 5. Priest Services & Price Snapshotting

1. **Priest-Specific Pricing (`PriestService`)**:
   - Each priest manages their own custom ceremonies and cash Dakshina (₹ INR) via the `PriestService` entity.
   - Priests can add, edit, activate, or deactivate services from `/priest/services`.

2. **Immutable Price Snapshots**:
   - When a devotee books a ceremony, the system captures the active `PriestService.price` and permanently snapshots it in `Booking.servicePrice` and `Booking.dakshinaAmount`.
   - Subsequent price modifications by the priest will never retroactively modify existing bookings.

---

## 6. Booking Lifecycle & State Transitions

```text
[ PENDING ] ──(Priest Accepts)──> [ CONFIRMED ] ──(Ceremony Done)──> [ COMPLETED ] ──(Devotee Rates)──> [ RATED ]
     │                                 │
     ├──(Priest Declines)──────────────┼──> [ REJECTED ] (Slot Freed)
     ├──(5-Hour Window Expires)────────┼──> [ EXPIRED ]  (Slot Freed)
     └──(Devotee Cancels)──────────────┴──> [ CANCELLED ] (Slot Freed)
```

- **5-Hour Expiration**: Bookings not acted upon by the priest within 5 hours transition to `EXPIRED`.
- **Slot Concurrency**: Creating a booking locks the `PriestSlot` into `BOOKED`. If the booking is rejected, cancelled, or expired, the slot is immediately released back to `AVAILABLE`.

---

## 7. Postal PIN Code Auto-Resolution

- **Endpoint**: `https://api.postalpincode.in/pincode/{PINCODE}`
- **Behavior**: Auto-detects 6-digit Indian PIN codes, identifies matching post offices/localities, and auto-populates Village/Town, District, and State for both Devotees and Purohits.
- **Offline Fallback**: Uses internal mock directory if offline or network unavailable.
