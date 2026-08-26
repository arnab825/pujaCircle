# 🕉️ PujaCircle — Developer Documentation & Guide

Welcome to the **PujaCircle** developer documentation! This documentation is written to be **detailed, intuitive, and beginner-friendly** for all developers working with JavaScript, TypeScript, React, Vite, and Zustand.

---

## 📚 Table of Contents

1. [Quick Overview](#1-quick-overview)
2. [Key Product & Domain Rules](#2-key-product--domain-rules)
3. [Project Directory Structure](#3-project-directory-structure)
4. [Getting Started (Step-by-Step)](#4-getting-started-step-by-step)
5. [Architecture & Tech Stack](#5-architecture--tech-stack)
6. [User Roles & Routing Map](#6-user-roles--routing-map)
7. [Booking Lifecycle State Machine](#7-booking-lifecycle-state-machine)
8. [Data Validation & Strict Schemas](#8-data-validation--strict-schemas)
9. [Error Handling & Security Best Practices](#9-error-handling--security-best-practices)
10. [Testing & Verification Suite](#10-testing--verification-suite)
11. [FAQ & Troubleshooting](#11-faq--troubleshooting)

---

## 1. Quick Overview

**PujaCircle** is a dedicated web platform connecting Hindu families (**Devotees**) with certified, Vedic-trained **Purohits (Priests)** for auspicious ceremonies (e.g., *Griha Pravesh*, *Satyanarayan Katha*, *Rudrabhishek*, *Namkaran*).

### What makes PujaCircle unique?
- **Verified Vedic Purohits**: Priests undergo manual credential and Gurukul lineage review by an Administrator.
- **Direct Cash Dakshina**: No online transaction charges or payment gateway fees. Devotees hand cash Dakshina directly to the Purohit after ceremony completion.
- **5-Hour Response SLA**: Priests accept or decline appointment requests within 5 hours, ensuring quick family planning.
- **Strict Input Validation**: Every form and API endpoint rejects malformed data upfront using strict Zod schemas.

---

## 2. Key Product & Domain Rules

| Rule | Description |
| :--- | :--- |
| **Offline Cash Dakshina** | All remunerations are settled directly between Devotee and Priest upon puja completion. No credit card or escrow fees. |
| **Priest-Specific Pricing** | Pricing is set per priest per ritual in `PriestService`. Each Purohit decides their own Dakshina rates. |
| **Authoritative Price Snapshot** | When a devotee requests a ceremony, the exact price is locked inside the booking record. If the priest later edits their catalog price, existing bookings retain their agreed snapshot. |
| **5-Hour Acceptance SLA** | Purohits have 5 hours to accept or decline. Unanswered bookings automatically transition to `EXPIRED` and free up the priest's calendar. |
| **Verified 5-Star Reviews** | Only the devotee who completed the ceremony can leave a verified rating (1–5 stars) and review. Duplicate or premature ratings are blocked. |
| **Max 2 Saved Addresses** | Devotees can save up to 2 primary ritual locations (e.g., Home and Office/Temple) for streamlined scheduling. |

---

## 3. Project Directory Structure

```text
pujaCircle/
├── backend/                   # Node.js / Express Backend (REST API)
│   ├── src/
│   │   ├── config/            # Environment variable validation with Zod
│   │   └── ...
│   └── package.json
│
├── frontend/                  # React 19 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── api/               # API clients with centralized error handling
│   │   │   ├── auth.api.ts
│   │   │   ├── address.api.ts
│   │   │   ├── booking.api.ts
│   │   │   ├── priest.api.ts
│   │   │   └── user.api.ts
│   │   ├── components/        # Reusable UI & Layout Components
│   │   │   ├── address/       # Address modal & selection
│   │   │   ├── booking/       # Booking dialogs & status badges
│   │   │   ├── common/        # PageHeader, StatusBadge, EmptyState, ErrorBoundary
│   │   │   ├── layout/        # Header, Footer, AdminLayout, PriestLayout
│   │   │   ├── priest/        # PriestCard, schedule modals
│   │   │   └── ui/            # shadcn/ui components (Button, Dialog, Card, Input)
│   │   ├── lib/               # Utilities & Error Sanitization
│   │   │   ├── errorHandler.ts # Safe error logging & leak prevention
│   │   │   └── utils.ts       # Formatters (formatINR, formatDate, formatTime)
│   │   ├── mocks/             # Deterministic Mock Database & Mock API
│   │   │   ├── db.ts          # Seed database with realistic Purohits
│   │   │   ├── mock-api.ts    # Fully functional async mock endpoints
│   │   │   └── test-mock-api.ts # 77+ automated domain test cases
│   │   ├── pages/             # Page routes grouped by role
│   │   │   ├── admin/         # Admin Dashboard, Priests moderation, Users
│   │   │   ├── auth/          # Login, Register, OTP verification
│   │   │   ├── priest/        # Priest Dashboard, Calendar, Services, Profile
│   │   │   ├── public/        # Home, About, Contact, Priest Directory
│   │   │   └── user/          # Devotee Home, Bookings, Addresses, Profile
│   │   ├── routes/            # App router & Protected Route Guards
│   │   │   └── app-router.tsx
│   │   ├── schemas/           # Strict Zod validation schemas
│   │   │   ├── admin.schema.ts
│   │   │   ├── address.schema.ts
│   │   │   ├── auth.schema.ts
│   │   │   ├── booking.schema.ts
│   │   │   ├── priest.schema.ts
│   │   │   └── user.schema.ts
│   │   └── store/             # Simple Zustand stores
│   │       ├── address.store.ts
│   │       ├── auth.store.ts
│   │       └── booking.store.ts
│   └── package.json
│
├── docs/                      # Comprehensive Documentation
└── package.json               # Root workspace scripts
```

---

## 4. Getting Started (Step-by-Step)

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
Run in the project root:
```bash
npm run install:all
```
*(Or navigate to `frontend/` and run `npm install`)*

### Step 2: Start the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Step 3: Run the Domain Verification Test Suite
```bash
npm run test:mock
```
This runs all 77 automated test cases verifying authentication, address validation, priest scheduling, price snapshots, and error sanitization.

### Step 4: Build for Production
```bash
npm run build
```

---

## 5. Architecture & Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript | High performance, strict types, modern hooks |
| **Build Tool** | Vite 6 | Lightning-fast development & optimized production bundling |
| **Styling** | Tailwind CSS v4 | Clean utility classes with semantic Vedic design tokens |
| **UI Kit** | shadcn/ui + Radix UI | Accessible, solid dialogs, dropdowns, inputs, and tabs |
| **State Management** | Zustand 5 | Plain, predictable store without boilerplate reducers |
| **Form Validation** | Zod 3 | Strict schema checks with fail-fast rejection |
| **Notifications** | Sonner | Lightweight, clean toast feedback |
| **Icons** | Lucide React | Modern SVG icons |

---

## 6. User Roles & Routing Map

PujaCircle enforces strict role isolation. Users can only access routes permitted for their role:

| Role | Default Landing | Allowed Routes |
| :--- | :--- | :--- |
| **Guest (Public)** | `/` | `/`, `/about`, `/contact`, `/user/login`, `/priest/login`, `/admin/login` |
| **Devotee (`USER`)** | `/user/home` | `/user/home`, `/user/priests`, `/user/priests/:id`, `/user/bookings`, `/user/bookings/:id`, `/user/addresses`, `/user/profile` |
| **Priest (`PRIEST`)** | `/priest/dashboard` | `/priest/dashboard`, `/priest/services`, `/priest/availability`, `/priest/bookings`, `/priest/profile`, `/priest/pending-approval` |
| **Admin (`ADMIN`)** | `/admin/dashboard` | `/admin/dashboard`, `/admin/priests`, `/admin/priests/:id`, `/admin/users`, `/admin/profile` |

---

## 7. Booking Lifecycle State Machine

```text
               ┌───────────────────────┐
               │        PENDING        │ ◄── Devotee submits booking request
               └───────────┬───────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │ (Priest Accepts)│ (Priest Rejects)│ (5-Hour Timeout)
         ▼                 ▼                 ▼
   ┌───────────┐     ┌───────────┐     ┌───────────┐
   │ CONFIRMED │     │ REJECTED  │     │  EXPIRED  │
   └─────┬─────┘     └───────────┘     └───────────┘
         │
         │ (Ceremony completed & cash settled)
         ▼
   ┌───────────┐
   │ COMPLETED │ ───(Devotee rates 1–5 stars)───► [ RATED ]
   └───────────┘
```

---

## 8. Data Validation & Strict Schemas

All input validation rules are centrally located in `frontend/src/schemas/`:

- **[auth.schema.ts](file:///d:/pujaCircle/frontend/src/schemas/auth.schema.ts)**:
  - Phone numbers: Indian 10-digit mobile format (`^(\+91)?[6-9]\d{9}$`).
  - OTPs: Exactly 6 numeric digits (`^\d{6}$`).
  - Passwords: Minimum 6 characters, maximum 100 characters.
- **[address.schema.ts](file:///d:/pujaCircle/frontend/src/schemas/address.schema.ts)**:
  - PIN codes: Exactly 6 digits, cannot start with 0 (`^[1-9][0-9]{5}$`).
  - House/flat number: Required, maximum 150 characters.
- **[priest.schema.ts](file:///d:/pujaCircle/frontend/src/schemas/priest.schema.ts)**:
  - Time slots: 24-hour HH:MM format (`^([01]\d|2[0-3]):([0-5]\d)$`).
  - Duration: 30 to 720 minutes.
  - Price: Positive whole integer in Indian Rupees (₹).
- **[booking.schema.ts](file:///d:/pujaCircle/frontend/src/schemas/booking.schema.ts)**:
  - Cancellation/Rejection reasons: Minimum 3 characters, maximum 500 characters.
  - Rating: Integer between 1 and 5 stars.

---

## 9. Error Handling & Security Best Practices

### Zero Internal Leaks to Users
- **[errorHandler.ts](file:///d:/pujaCircle/frontend/src/lib/errorHandler.ts)** intercepts raw errors. If an error contains file paths (`C:\...`, `/Users/...`), stack trace lines (`at eval`, `at function:line`), or SQL/database keywords (`SELECT`, `table`, `pg_`), it is automatically replaced with a clean fallback (e.g., *"An unexpected error occurred. Please try again."*).
- Full stack traces and context payloads are logged server-side via `logAppError` for developer debugging.

### React Error Boundary
- **[ErrorBoundary.tsx](file:///d:/pujaCircle/frontend/src/components/common/ErrorBoundary.tsx)** catches uncaught component rendering exceptions and displays a graceful fallback screen with *Reload Page* and *Return Home* options.

---

## 10. Testing & Verification Suite

To run all automated domain and SRS test cases:
```bash
npm run test:mock
```

**77 Automated Tests Cover:**
1. Initial database structure and integrity.
2. Multi-role login, OTP generation, and validation rejection.
3. PIN code auto-lookup and address constraints.
4. Priest custom service pricing and permissions.
5. Weekly recurring rules and calendar exception overrides.
6. Authoritative price snapshotting and double-booking prevention.
7. Booking state machine transitions and cancellation reason validation.
8. Verified 5-star ratings and owner-only review restrictions.
9. Administrator priest approval, rejection, and account bans.
10. Error sanitization and filesystem path leak prevention.

---

## 11. FAQ & Troubleshooting

### Q: Why did clicking "Book Pooja" redirect to Home?
**A:** Ensure links point to the canonical devotee route `/user/priests/:id`. The route is registered in [app-router.tsx](file:///d:/pujaCircle/frontend/src/routes/app-router.tsx).

### Q: Why should cards not be transparent?
**A:** The application uses a subtle background grid (`GridBackground.tsx`). Cards must have solid backgrounds (`bg-card` / `bg-white dark:bg-card`) to ensure crisp text legibility and prevent the grid lines from showing through.

### Q: How do I test different roles?
Use the seed accounts configured in [db.ts](file:///d:/pujaCircle/frontend/src/mocks/db.ts):
- **Devotee**: `+919876543210` / password: `User@123` (or OTP `123456`)
- **Priest**: `+919876501234` / password: `Priest@123` (or OTP `123456`)
- **Admin**: `admin@pujacircle.demo` / password: `Admin@123`

---

*Made with devotion for PujaCircle developers.* 🕉️
