# PujaCircle 🕉️

> **"Traditional rituals, made easier for modern India."**

PujaCircle is a web-first platform designed to help devotees across Indian urban centers arrange traditional Vedic rituals, pujas, and ceremonies by connecting them with verified, knowledgeable purohits with transparent, priest-specific pricing and offline cash Dakshina.

---

## 📌 Repository Boundary & Status

This repository is structured for seamless collaboration by a 5-person engineering team. The repository enforces clean architectural boundaries:

| Layer | Implementation Status | Description |
| :--- | :--- | :--- |
| **Frontend UI Application** | **🟢 Fully Implemented & Modular** | Clean React 19 + TypeScript + Vite architecture. Fully functional user portal (`/user/*`), priest dashboard (`/priest/*`), and admin console (`/admin/*`). All pages modularized into small (< 150 lines), beginner-friendly components. |
| **Frontend Mock Engine** | **🟢 Fully Functional (33/33 Tests Pass)** | Complete in-memory mock database, delay simulation, priest-specific pricing, price snapshot locking, 5-hour booking response windows, and verified 5-star ratings. |
| **Frontend Design System** | **🟢 Complete** | Modern semantic design tokens (Saffron, Regal Maroon, Gold, Warm Ivory), accessible typography, and official shadcn/ui components. |
| **Backend Services & DB** | **🟡 Architecture Scaffolds** | Express, Drizzle ORM, Zod schemas, and security middleware scaffolds. |
| **Documentation (`docs/`)** | **🟢 Source of Truth** | Comprehensive specifications (PRD, SRS, UX flows, API contracts, architecture diagrams). |

---

## 🚫 Hard Product Constraints (Phase 1)

These constraints are **NON-NEGOTIABLE**:

1. **Web Only**: No mobile applications. Fully responsive web design.
2. **No Live Priest Tracking**: No GPS or real-time map tracking.
3. **No Online Priest Payments**: Priests are remunerated offline directly in cash upon ceremony completion. Booking statuses: `PENDING` → `CONFIRMED` / `REJECTED` / `EXPIRED` / `CANCELLED` → `COMPLETED`.
4. **No E-Commerce**: Samagri item delivery belongs to Phase 2.
5. **Priest-Specific Pricing**: Priests define their own cash Dakshina per service via `PriestService`. The price is locked authoritatively into the booking at request time.
6. **Priest Approval Required**: Devotees verify via phone/email OTP; Purohits verify via OTP followed by manual admin review and approval.
7. **Simplified Indian Address Model**: PIN code auto-resolves locality, village/town, district, and state.
8. **5-Hour Priest Response Window**: Purohits have 5 hours to accept or decline before a booking expires.
9. **Verified Ratings Only**: 1–5 star ratings are permitted only on `COMPLETED` ceremonies by the devotee who booked.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS Variables Design System
- **UI Components**: shadcn/ui + Radix UI primitives + Lucide React
- **Routing**: React Router v7
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form + Zod + `@hookform/resolvers`
- **HTTP Client**: Axios (configured with credentials and base URL)
- **Utilities**: `date-fns`, `sonner` (toasts), `clsx`, `tailwind-merge`

### Backend (Scaffolded Placeholder)
- **Runtime**: Node.js + Express + TypeScript (`tsx`)
- **ORM & Database**: Drizzle ORM + PostgreSQL (Supabase)
- **Security & Utilities**: `zod`, `jsonwebtoken`, `bcryptjs`, `helmet`, `cookie-parser`, `cors`, `dotenv`, `imagekit`

---

## 📁 Repository Structure

```
pujaCircle/
├── frontend/                     # React 19 + Vite + Tailwind + shadcn/ui application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── api/                  # Lightweight API service wrappers
│   │   ├── components/
│   │   │   ├── address/          # AddressModal, AddressCard
│   │   │   ├── admin/            # PriestApprovalTable, UserManagementTable, PriestActionDialogs, UserActionDialogs
│   │   │   ├── auth/             # AuthLoginForm, OtpVerificationCard, Forgot/Reset Cards
│   │   │   ├── booking/          # BookingStatusBadge, RatingModal, CancelBookingDialog, BookingTimelineCard
│   │   │   ├── common/           # ErrorBoundary, RoleRouteGuard, LoadingSpinner, EmptyState
│   │   │   ├── layout/           # Header, Footer, PriestLayout, AdminLayout, PublicLayout
│   │   │   ├── priest/           # AddSlotModal, ServiceFormModal, PriestBookingRow, PriestBookingDetailsDialog
│   │   │   └── ui/               # Reusable shadcn/ui primitives
│   │   ├── lib/                  # Utilities (formatINR, formatDate, cn, constants, config)
│   │   ├── mocks/                # Mock DB, Mock APIs, artificial network delay, 11-suite test runner
│   │   ├── pages/                # Thin, readable page orchestrators (< 150 lines each)
│   │   │   ├── admin/            # AdminDashboard, AdminPriests, AdminPriestDetails, AdminUsers, AdminProfile
│   │   │   ├── auth/             # Devotee, Priest & Admin login/register/recovery pages
│   │   │   ├── priest/           # PriestDashboard, PriestServices, PriestAvailability, PriestBookings, PriestProfile
│   │   │   ├── public/           # HomePage, AboutPage, ContactPage, PriestListingPage, PriestDetailsPage
│   │   │   └── user/             # UserHomePage, BookingsPage, BookingDetailsPage, AddressesPage, ProfilePage
│   │   ├── routes/               # App router with role guards and code-split lazy loading
│   │   ├── schemas/              # Strict Zod validation schemas
│   │   ├── store/                # Zustand stores (auth.store, booking.store)
│   │   ├── types/                # TypeScript interfaces (priest, booking, address, auth, user)
│   │   ├── App.tsx               # Root component with ErrorBoundary
│   │   ├── index.css             # Theme variables & typography
│   │   └── main.tsx              # Application entrypoint
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                      # Express + Drizzle architectural scaffold
│   ├── src/
│   │   ├── config/               # Environment & DB config skeletons
│   │   ├── controllers/          # Controller skeletons
│   │   ├── db/                   # Schema definitions & seed skeletons
│   │   ├── middlewares/          # Auth, role, error & validation middlewares
│   │   ├── routes/               # Express route skeletons
│   │   ├── services/             # Service skeletons
│   │   ├── types/                # Express type extensions
│   │   ├── utils/                # Response helpers & logger
│   │   ├── validations/          # Zod validation skeletons
│   │   ├── app.ts                # Express app setup
│   │   └── server.ts             # HTTP server entrypoint
│   ├── drizzle/                  # Migration directory
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                         # Comprehensive Documentation (Source of Truth)
│   ├── 01-product/               # PRD, SRS, Scope, User Personas
│   ├── 02-design/                # Design tokens, Color palette, Typography, UX flows
│   ├── 03-architecture/          # System, Frontend, Backend, DB & Deployment architecture
│   ├── 04-api/                   # REST API contracts & endpoint specifications
│   ├── 05-database/              # ERD, Backend schema specifications, Relationships, Seed data
│   ├── 06-diagrams/              # Mermaid workflow and sequence diagrams
│   ├── 07-development/           # Setup, Git workflow, Branching, PR guidelines, Code style
│   ├── 08-ai/                    # AI development rules, SKILLS.md, Prompts, Review guide
│   └── 09-testing/               # Test plan, Test cases, Edge cases, Acceptance tests
│
├── .github/                      # Automated CI testing pipeline (ci.yml)
├── .gitignore
├── LICENSE
├── package.json                  # Root runner & developer scripts
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd pujaCircle
   ```

2. **Install all dependencies:**
   ```bash
   # Install root dependencies
   npm install

   # Install frontend dependencies
   cd frontend && npm install && cd ..

   # Install backend dependencies
   cd backend && npm install && cd ..
   ```

3. **Configure Environment Variables:**
   ```bash
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

---

## 💻 Running the Application

### Running Frontend with Mock API (Recommended for UI Development)
The frontend is preconfigured to run with the functional Mock API layer without needing a backend server:
```bash
npm run frontend
```
Visit `http://localhost:5173` in your browser.

### Running Both Frontend & Backend Concurrently
```bash
npm run dev
```

### Validating Mock APIs & Business Rules
Run the 11 comprehensive automated SRS test suites directly in the terminal:
```bash
npm run test:mock
```

---

## 🧪 Demo Test Credentials

| Role | Login Identifier | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Devotee** | `+919876543210` | `User@123` | `/user/login` (Redirects to `/user/home`) |
| **Purohit (Approved)** | `+919876543211` | `Priest@123` | `/priest/login` (Redirects to `/priest/dashboard`) |
| **Purohit (Pending)** | `+919876543213` | `Priest@123` | `/priest/login` (Redirects to `/priest/pending-approval`) |
| **Administrator** | `admin@pujacircle.demo` | `Admin@123` | `/admin/login` (Redirects to `/admin/dashboard`) |

---

## 🎨 Design System & Theme

PujaCircle utilizes a spiritual yet modern visual identity defined via CSS variables in `frontend/src/index.css`:

- **Primary (`--primary` / `--brand-saffron`)**: Sacred Saffron / Deep Orange (`hsl(28, 92%, 52%)`)
- **Secondary (`--secondary` / `--brand-maroon`)**: Deep Regal Maroon (`hsl(348, 65%, 28%)`)
- **Accent (`--accent` / `--brand-gold`)**: Warm Temple Gold (`hsl(42, 85%, 55%)`)
- **Background (`--background` / `--brand-ivory`)**: Warm Ivory Neutral (`hsl(40, 33%, 98%)`)
- **Foreground (`--foreground` / `--brand-charcoal`)**: Deep Charcoal (`hsl(220, 20%, 14%)`)

---

## 📖 Documentation Quick Links

- [Product Requirements Document (PRD)](file:///Users/subhajit/Developer/Development/pujaCircle/docs/01-product/PRD.md)
- [Software Requirements Specification (SRS)](file:///Users/subhajit/Developer/Development/pujaCircle/docs/01-product/SRS.md)
- [Frontend Architecture Specification](file:///Users/subhajit/Developer/Development/pujaCircle/docs/03-architecture/frontend-architecture.md)
- [Design System & UX Flows](file:///Users/subhajit/Developer/Development/pujaCircle/docs/02-design/DESIGN.md)
- [API Contracts](file:///Users/subhajit/Developer/Development/pujaCircle/docs/04-api/API.md)
- [Backend Database Schema](file:///Users/subhajit/Developer/Development/pujaCircle/docs/05-database/backend-schema.md)
