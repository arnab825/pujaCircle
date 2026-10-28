# PujaCircle 🕉️

> **"Traditional Vedic rituals, made easier for modern India."**

PujaCircle is a production-grade, full-stack web platform engineered to connect devotees across India with verified, knowledgeable Vedic Purohits (priests). Built with a robust **MVC architecture** in the backend and a modern **React 19 + Tailwind CSS v4** single-page application on the frontend, PujaCircle delivers authentic ceremonial booking, transparent priest-defined pricing, immutable price-locking snapshots, exception-based Muhurat scheduling, and offline cash dakshina settlement.

---

## 📊 Engineering Highlights & Metrics

| Metric                               | Measurement                   | Technical Impact                                                                                                                                                 |
| :----------------------------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Production Frontend Bundle**       | **374.5 kB** (Main Chunk)     | Optimized via Vite 6 + Rollup `manualChunks` vendor splitting (`vendor-react`, `vendor-motion`, `vendor-base-ui`, `vendor-icons`)                                |
| **Strict Type Safety**               | **100% TypeScript (Strict)**  | End-to-end type safety across backend and frontend with Zod schema validation on all API boundaries                                                              |
| **Code Quality Standards**           | **0 Errors, 0 Warnings**      | Clean `npm run lint` & `npm run typecheck` across both backend and frontend repositories                                                                         |
| **Test Suite**                       | **100% Passing**              | Built-in automated testing for calendar availability, timezone parsing (Asia/Kolkata), and schema validation (`npm run test`)                                    |
| **Security & Vulnerability Pruning** | **Production Grade**          | Zero unused dependencies (purged `bcryptjs`, `uuid`, `@tanstack/react-query`); Rate-limiting on APIs & OTP; Helmet security headers; CORS credentials protection |
| **Email Dispatch Engine**            | **Brevo REST API**            | HTTPS port-agnostic transactional email dispatch (Render free-tier safe; eliminates blocked SMTP ports)                                                          |
| **Media Cloud Storage**              | **Cloudinary Direct Upload**  | Secure signed media uploads & automated asset lifecycle management (< 2MB file size guard)                                                                       |
| **Auspicious Calendar Engine**       | **Dynamic Exception Windows** | Working-hours window calculation subtracting full-day leaves, partial blackouts, and active ceremony bookings                                                    |
| **Settlement & Integrity Model**     | **Offline Cash Dakshina**     | Zero payment gateway friction; immutable price locking at request creation; 4-digit completion code verification                                                 |

---

## 🏛️ Full-Stack System Architecture

```mermaid
flowchart TB
    subgraph ClientTier["Frontend Client Tier (React 19 + TypeScript + Vite 6 + Tailwind v4)"]
        direction TB
        subgraph DevoteePortal["Devotee Portal"]
            D1["Public Discovery & Hero Carousel"]
            D2["Vedic Puja Catalog & Vidhi Guidelines"]
            D3["Purohit Search & Dynamic Muhurat Booking"]
            D4["Saved Venue Addresses & Order History"]
            D5["Verified 5-Star Post-Ceremony Reviews"]
        end
        subgraph PriestPortal["Purohit Workspace"]
            P1["Custom Service Catalog & Pricing (₹)"]
            P2["Configurable Working Hours (e.g. 07:00 - 21:00)"]
            P3["Full-Day Leaves & Blackout Hours Management"]
            P4["Booking Acceptance & Completion Code Verification"]
        end
        subgraph AdminPortal["Admin Console"]
            A1["Purohit Vetting, Approval & Suspension"]
            A2["Devotee Moderation & Account Controls"]
            A3["Sacred Puja Catalog Management & Media Upload"]
            A4["Platform KPI Dashboard & Ceremony Oversight"]
        end
    end

    subgraph SecurityGateway["Security, Validation & Middleware Layer"]
        M1["Helmet Security Headers & Strict CORS"]
        M2["Express Rate Limiting (General, Auth, OTP)"]
        M3["Zod Schema Validation (Body, Params, Query)"]
        M4["Authentication Guard (Supabase JWT / Internal App JWT)"]
        M5["Role-Based Access Control (Devotee, Priest, Admin)"]
        M6["Global Error Handler (Zero DB/Stack Trace Leaks)"]
    end

    subgraph BackendTier["Backend MVC Tier (Node.js + Express + TypeScript)"]
        direction TB
        R["Modular Route Handlers (/api/v1/*)"]
        C["Controllers (Slim HTTP Orchestrators)"]
        S["Services (Domain Business Logic)"]
        REP["Shared Repositories & Utilities"]
        V["Views & Presentation ViewModels"]
        R --> C --> S --> REP
        C --> V
    end

    subgraph DataAndCloudTier["Data & Cloud Services Tier"]
        DB[("PostgreSQL Database via Drizzle ORM")]
        SB["Supabase Auth & Identity Provider"]
        CL["Cloudinary Media Storage"]
        BR["Brevo HTTPS Transactional Email API"]
        PIN["India Post PIN Code Lookup Directory API"]
    end

    ClientTier --> SecurityGateway
    SecurityGateway --> BackendTier
    BackendTier --> DataAndCloudTier
```

---

## 🔄 Core Ceremony Booking Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING: Devotee Submits Booking Request\n(Authoritative Price Snapshot Locked in ₹)

    state PENDING {
        direction LR
        [*] --> AwaitingPriest: Awaiting Purohit Response
    }

    PENDING --> CONFIRMED: Priest Accepts Request
    PENDING --> REJECTED: Priest Declines (Reason Required)
    PENDING --> CANCELLED: Devotee Cancels

    CONFIRMED --> CANCELLED: Devotee or Priest Cancels (Reason Required)
    CONFIRMED --> COMPLETED: Vidhi Performed + 4-Digit Code Verified + Cash Dakshina Paid

    COMPLETED --> RATED: Devotee Submits 1–5 Star Rating & Review
    COMPLETED --> [*]
    RATED --> [*]
    REJECTED --> [*]
    CANCELLED --> [*]
```

---

## 🛡️ Core Architectural Principles & Business Rules

1. **Strict MVC Pattern**: The backend adheres strictly to the Model-View-Controller pattern familiar to Spring Boot and enterprise engineers (Models define entities, Controllers process HTTP requests, Services execute domain logic, Repositories handle database lookups, and Views/ViewModels sanitize outgoing JSON payloads).
2. **Offline Cash Dakshina Settlement**: Direct cash remuneration between devotee and priest upon ceremony completion. Zero payment gateway fees, zero transaction surcharges, and zero escrow risks.
3. **Immutable Price Snapshots**: Priests set individual pricing per ritual offering. When a booking request is submitted, the price is snapshot-locked into the booking record (`servicePrice` and `totalPrice`), guaranteeing that subsequent price modifications by the priest never alter ongoing or past bookings.
4. **4-Digit Completion Code Verification**: When a ceremony is confirmed, an authentic random 4-digit completion code is generated for the devotee. Upon performing the vidhi, the priest enters this code to confirm completion, ensuring non-repudiable ceremony execution.
5. **Dynamic Exception-Based Muhurat Scheduling**: Priests configure standard daily working hours (e.g. 07:00 to 21:00). Available booking slots are dynamically generated by calculating:
   $$\text{Available Windows} = [\text{Working Hours}] - [\text{Full-Day Leaves}] - [\text{Blackout Hours}] - [\text{Confirmed Bookings}]$$
6. **Strict Two-Step Purohit Verification**: Devotees register and verify via email/phone OTP. Purohits undergo credential verification followed by mandatory administrative vetting before their profile appears in public search.
7. **Automated Postal PIN Code Resolution**: 6-digit Indian PIN codes resolve locality, city, district, and state through automated lookup.
8. **Verified Reviews Only**: 1–5 star ratings and reviews are strictly restricted to the devotee who booked the ceremony and can only be submitted once the booking status transitions to `COMPLETED`.

---

## 🛠️ Technology Stack

### Frontend Application

- **Core Framework**: React 19 + TypeScript (Strict Mode)
- **Build Tooling**: Vite 6 + Rollup Code Splitting
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` + `@plugin "tailwindcss-animate"`)
- **UI Primitives**: `@base-ui/react` (Headless accessible primitives) + Lucide React icons
- **Typography**: `@fontsource/fraunces` (Serif heading typography) + `@fontsource/inter` (Clean sans body)
- **Animations**: Framer Motion with app-wide reduced-motion accessibility (`MotionProvider`)
- **Routing**: React Router v7 with declarative route guards (`RoleRouteGuard`, `GuestOnlyRoute`, `PublicRouteGuard`)
- **State Management**: Zustand (Local persistent session store)
- **Forms & Validation**: React Hook Form + Zod (`@hookform/resolvers/zod`)
- **HTTP Client**: Axios with Bearer token injection and centralized error sanitization (`errorHandler.ts`)
- **Toast Notifications**: Sonner

### Backend Application

- **Runtime**: Node.js + Express 4 + TypeScript (`tsx` in dev, `tsc` in production)
- **ORM & Database**: Drizzle ORM + PostgreSQL (`postgres.js` connection pool)
- **Authentication**: Supabase Auth + Internal App JWT (7-day session token, Bearer header & HTTP-only cookies)
- **Transactional Email**: Brevo (Sendinblue) HTTPS REST API v3 (Render free-tier safe; 300 free emails/day)
- **Media Cloud Storage**: Cloudinary SDK (Direct upload signatures, 2MB size enforcement, automatic asset deletion)
- **Security & Headers**: Helmet, Cookie-Parser, CORS (with credentials & allowed origins), Express Rate Limit
- **Validation**: Zod request schema validation middleware (`validate.middleware.ts`)
- **Error Handling**: Custom `AppError` class with global error sanitization preventing raw database leaks

---

## 📁 Repository Structure

```
pujaCircle/
├── frontend/                     # React 19 + Vite 6 + Tailwind CSS v4 Application
│   ├── public/                   # Static assets, favicons, localized Vedic ritual photography
│   ├── src/
│   │   ├── api/                  # Explicit typed API clients (auth, priest, user, booking, admin, catalog, address)
│   │   ├── components/
│   │   │   ├── admin/            # Approval tables, moderation dialogs, user action modals
│   │   │   ├── auth/             # Role tabs, OTP verification card, password reset cards
│   │   │   ├── booking/          # Status badges, rating modal, cancellation dialog, timeline
│   │   │   ├── common/           # ErrorBoundary, logo, carousels, route guards, spinners
│   │   │   ├── layout/           # Navbar, footer, dashboard sidebar shells
│   │   │   ├── legal/            # Terms, privacy, and cookie policy modals
│   │   │   ├── priest/           # Service form, block time, complete booking modals
│   │   │   └── ui/               # Base UI primitives (dialog, sheet, select, tabs, button, etc.)
│   │   ├── lib/                  # Utilities (errorHandler, availabilityUtils, constants, config)
│   │   ├── motion/               # Framer-motion animation variants
│   │   ├── pages/                # Modular page orchestrators
│   │   │   ├── admin/            # Dashboard stats, priests, users, catalog console
│   │   │   ├── auth/             # Devotee, priest, and admin authentication flows
│   │   │   ├── priest/           # Dashboard, availability calendar, services, bookings, profile
│   │   │   ├── public/           # Home, about, contact, priest directory, priest details
│   │   │   └── user/             # Home, bookings, booking details, addresses, profile
│   │   ├── routes/               # Declarative code-split route graph (app-router.tsx)
│   │   ├── schemas/              # Zod validation schemas for forms
│   │   ├── store/                # Zustand persistent auth state store
│   │   └── types/                # Domain entity interfaces
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Express 4 + Drizzle ORM MVC Backend
│   ├── drizzle/                  # Drizzle SQL migrations
│   ├── src/
│   │   ├── config/               # Environment validation (env.ts), Cloudinary, Supabase
│   │   ├── controllers/          # Controllers (auth, admin, user, priest, booking, catalog, etc.)
│   │   ├── db/                   # Database client connection pool (index.ts) & seed script (seed.ts)
│   │   ├── middlewares/          # Auth, role-based guard, rate limiters, validation, global error
│   │   ├── models/               # Drizzle table definitions & entity relations
│   │   ├── repositories/         # Canonical data access helpers (priest.repository.ts)
│   │   ├── routes/               # Modular Express routers (11 domain subrouters)
│   │   ├── schemas/              # Zod input validation schemas
│   │   ├── services/             # Business logic layer (auth, booking, availability, priest, admin, etc.)
│   │   ├── tests/                # Automated backend tests (availability.test.ts)
│   │   ├── types/                # Express request extensions & role types
│   │   ├── utils/                # AppError, pagination helpers, auth utilities
│   │   ├── views/                # Presentation ViewModels & JSON serializers
│   │   ├── app.ts                # Express application factory & middleware stack
│   │   └── server.ts             # Server entry point & graceful shutdown
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                         # Authoritative Project Documentation
│   ├── PRD.md                    # Product Requirements Document
│   ├── SRS.md                    # Software Requirements Specification
│   ├── TRD.md                    # Technical Requirements Document
│   └── DESIGN.md                 # Design System & Aesthetic Guidelines
│
├── package.json                  # Root monorepo orchestration & scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher
- **PostgreSQL Database**: Local PostgreSQL or cloud instance (e.g. Supabase / Neon / Render PostgreSQL)

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd pujaCircle

# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Environment Configuration

Create a `.env` file in `backend/` using the template below:

```ini
PORT=5000
NODE_ENV=development

# PostgreSQL Database Connection URL
DATABASE_URL=postgresql://postgres:password@localhost:5432/pujacircle

# Supabase Authentication & Admin
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_JWT_SECRET=your-supabase-jwt-secret

# JWT & Session Secrets
JWT_SECRET=super-secret-pujacircle-jwt-key
JWT_EXPIRES_IN=7d
COOKIE_SECRET=super-secret-pujacircle-cookie-key
CLIENT_URL=http://localhost:5173

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo (Sendinblue) Transactional REST API
BREVO_API_KEY=your-brevo-api-key
BREVO_SENDER_EMAIL=noreply@pujacircle.com
BREVO_SENDER_NAME="PujaCircle Sanctum"
```

Create a `.env` file in `frontend/`:

```ini
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Database Migration & Seeding

```bash
# Run database migrations via Drizzle Kit:
cd backend
npm run db:migrate

# (Optional) Seed the database:
npm run db:seed
cd ..
```

### 4. Running Locally

```bash
# Run both Frontend and Backend concurrently from root:
npm run dev

# Or run services individually:
npm run frontend   # Starts Vite dev server at http://localhost:5173
npm run backend    # Starts Express server at http://localhost:5000
```

### 5. Running Tests & Quality Audits

```bash
# Run automated backend test suite:
npm run test

# Run full-stack TypeScript typechecking:
npm run typecheck

# Run full-stack linter check:
npm run lint

# Run production builds:
npm run build
```

---

## 🎨 Design System & Palette

PujaCircle adheres to an intentional, culturally resonant design system defined in `frontend/src/index.css`:

- **Primary (`--color-brand-primary` / Deep Saffron)**: Auspicious energy and devotion.
- **Secondary (`--color-brand-secondary` / Regal Maroon)**: Vedic heritage, sacred sanctity, and authority.
- **Accent (`--color-brand-accent` / Warm Gold)**: Divine illumination and prosperity.
- **Canvas (`--color-background` / Chandan Ivory)**: Organic paper-like readability with warm undertones.
- **Typography**:
  - Headings & Ceremonies: **Fraunces** (`--font-serif` / variable serif)
  - UI Controls & Data Tables: **Inter** (`--font-sans` / clean modern sans-serif)

---

## 📖 Specifications & Architecture Documents

- [Product Requirements Document (PRD)](./docs/PRD.md) — Comprehensive product scope, user personas, and business rules.
- [Software Requirements Specification (SRS)](./docs/SRS.md) — Functional and non-functional engineering requirements.
- [Technical Requirements Document (TRD)](./docs/TRD.md) — End-to-end full-stack architecture, schemas, and API definitions.
- [Design System & Aesthetic Guidelines](./docs/DESIGN.md) — Color tokens, typography, motion curves, and layout rules.
- [Contributing Guidelines](./CONTRIBUTING.md) — Contribution workflow and engineering conventions.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
