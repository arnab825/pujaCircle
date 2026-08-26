# Frontend Architecture Specification - PujaCircle 🕉️

## 1. Routing & Experience Boundaries

The application enforces strict, role-isolated routing boundaries managed by [app-router.tsx](file:///Users/subhajit/Developer/Development/pujaCircle/frontend/src/routes/app-router.tsx) and [RoleRouteGuard.tsx](file:///Users/subhajit/Developer/Development/pujaCircle/frontend/src/components/common/RoleRouteGuard.tsx):

```
[ Public & Marketing (Unauthenticated / Guests) ]
  ├── Landing Page (/)
  ├── About Us (/about)
  ├── Contact Us (/contact)
  └── Role Auth Portals (/user/login, /priest/login, /admin/login, register & recovery)

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

## 2. Priest Services & Authoritative Price Snapshot Model

1. **Priest-Specific Pricing (`PriestService`)**:
   - Each priest manages their own custom ceremonies and cash Dakshina (₹ INR) via the `PriestService` entity.
   - Priests can add, edit, activate, or deactivate services from `/priest/services`.

2. **Immutable Price Snapshots**:
   - When a devotee books a ceremony, the mock API authoritatively captures the active `PriestService.price` and permanently snapshots it in `Booking.servicePrice` and `Booking.dakshinaAmount`.
   - Subsequent price modifications by the priest will never retroactively modify existing bookings.

---

## 3. Booking Lifecycle & State Transitions

```
[ PENDING ] ──(Priest Accepts)──> [ CONFIRMED ] ──(Ceremony Done)──> [ COMPLETED ] ──(Devotee Rates)──> [ RATED ]
     │                                 │
     ├──(Priest Declines)──────────────┼──> [ REJECTED ] (Slot Freed)
     ├──(5-Hour Window Expires)────────┼──> [ EXPIRED ]  (Slot Freed)
     └──(Devotee Cancels)──────────────┴──> [ CANCELLED ] (Slot Freed)
```

* **5-Hour Expiration**: Bookings not acted upon by the priest within 5 hours transition to `EXPIRED`.
* **Slot Concurrency**: Creating a booking locks the `PriestSlot` into `BOOKED`. If the booking is rejected, cancelled, or expired, the slot is immediately released back to `AVAILABLE`.

---

## 4. Postal PIN Code Auto-Resolution

- **Postal Lookup**: `https://api.postalpincode.in/pincode/{PINCODE}`
- **Behavior**: Auto-detects 6-digit Indian PIN codes, identifies matching post offices/localities, and auto-populates Village/Town, District, and State for both Devotees and Purohits.
