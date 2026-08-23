# PujaCircle 🕉️

> **"Traditional rituals, made easier for modern India."**

PujaCircle is a web-only platform designed to help busy individuals and families across Indian urban centers arrange traditional Vedic rituals, pujas, and ceremonies by connecting them with verified, knowledgeable priests.

---

## 📌 Repository Boundary & Status

This repository is structured for an immediate kick-off by a 5-person engineering team. The repository enforces strict architectural boundaries:

| Layer | Implementation Status | Description |
| :--- | :--- | :--- |
| **Frontend UI Pages** | **Category A: Skeletons** | Minimal React functional components with standard route structure. Ready for UI development. |
| **Frontend Mock System** | **Category B: Fully Functional** | Complete in-memory mock database, async delay simulator, and mock API services covering Auth, Priests, Addresses, Bookings, and Admin approvals. Works standalone without a backend. |
| **Frontend Design System** | **Category B: Complete** | Scalable theme variables (Saffron, Maroon, Gold, Warm Ivory), typography tokens, and all official shadcn/ui components installed. |
| **Backend Services & DB** | **Category A: Skeletons** | Express, Drizzle ORM, Zod, and middleware architectural scaffolds. No business logic or database queries implemented yet. |
| **Documentation (`docs/`)** | **Category C: Source of Truth** | Comprehensive specifications (PRD, SRS, UX flows, API contracts, backend schema, Mermaid diagrams, AI agent guidance). |

---

## 🚫 Hard Product Constraints (Phase 1)

These constraints are **NON-NEGOTIABLE**:

1. **Web Only**: No mobile applications (no React Native, Flutter, iOS, Android). Fully responsive web design.
2. **No Live Priest Tracking**: No GPS or real-time map tracking.
3. **No Online Priest Payments**: Priests are remunerated offline directly. Booking payment statuses are `PENDING` and `PAID_OFFLINE`. No payment gateway SDKs (Razorpay/Stripe).
4. **No E-Commerce**: Puja samagri / item kits belong to Phase 2.
5. **Priest Approval Required**: Normal users only require phone OTP verification; Priests require phone OTP verification followed by admin verification and manual approval.
6. **Addresses as a Core Feature**: Complete Indian address support with house/building, street, locality, landmark, PIN code, city, district, and state.
7. **Modal-First UX**: Focused actions (login, OTP, address create/edit, booking confirmation) use dialogs/drawers; pages are reserved for major destinations.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS Variables Design System
- **UI Components**: shadcn/ui + Radix UI primitives + Lucide React
- **Routing**: React Router v7 / v6 (DOM)
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
├── frontend/                     # React + Vite + Tailwind + shadcn/ui application
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── api/                  # API abstraction layer (delegates to mock API)
│   │   ├── assets/               # Local icons and SVGs
│   │   ├── components/           # UI components (common, layout, auth, address, priest, booking, ui)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utilities (cn, constants, config)
│   │   ├── mocks/                # Mock DB, Mock APIs, artificial network delay
│   │   ├── pages/                # Page skeletons (public, auth, user, priest, admin)
│   │   ├── routes/               # App routing definitions
│   │   ├── schemas/              # Zod validation schemas
│   │   ├── store/                # Zustand client stores
│   │   ├── types/                # TypeScript interfaces & domain types
│   │   ├── App.tsx               # Root component
│   │   ├── index.css             # Theme variables & global typography
│   │   └── main.tsx              # Entrypoint
│   ├── components.json           # shadcn/ui configuration
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
├── .github/                      # CI workflow & Issue/PR templates
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

### Validating Mock APIs
To test the in-memory mock database, delay simulation, and CRUD operations directly in terminal:
```bash
npm run test:mock
```

---

## 🎨 Design System & Theme

PujaCircle utilizes a spiritual yet modern visual identity tailored for India. The color scheme is defined via CSS variables in `frontend/src/index.css`:

- **Primary (`--primary` / `--brand-saffron`)**: Sacred Saffron / Deep Orange (`hsl(28, 92%, 52%)`)
- **Secondary (`--secondary` / `--brand-maroon`)**: Deep Regal Maroon (`hsl(348, 65%, 28%)`)
- **Accent (`--accent` / `--brand-gold`)**: Warm Temple Gold (`hsl(42, 85%, 55%)`)
- **Background (`--background` / `--brand-ivory`)**: Warm Ivory Neutral (`hsl(40, 33%, 98%)`)
- **Foreground (`--foreground` / `--brand-charcoal`)**: Deep Charcoal (`hsl(220, 20%, 14%)`)

---

## 📖 Documentation Quick Links

Before making changes or implementing features, consult the source-of-truth documentation:

- [Product Requirements Document (PRD)](file:///Users/subhajit/Developer/Development/pujaCircle/docs/01-product/PRD.md)
- [Software Requirements Specification (SRS)](file:///Users/subhajit/Developer/Development/pujaCircle/docs/01-product/SRS.md)
- [Design System & UX Flows](file:///Users/subhajit/Developer/Development/pujaCircle/docs/02-design/DESIGN.md)
- [Frontend Architecture](file:///Users/subhajit/Developer/Development/pujaCircle/docs/03-architecture/frontend-architecture.md)
- [API Contracts](file:///Users/subhajit/Developer/Development/pujaCircle/docs/04-api/API.md)
- [Backend Database Schema](file:///Users/subhajit/Developer/Development/pujaCircle/docs/05-database/backend-schema.md)
- [AI Development Rules & Skills](file:///Users/subhajit/Developer/Development/pujaCircle/docs/08-ai/SKILLS.md)

---

## 👥 Git Workflow & Contributing

- Branch naming: `feature/<feature-name>`, `fix/<bug-name>`, `docs/<topic>`.
- Always open PRs against `develop` or `main` using the provided [Pull Request Template](file:///Users/subhajit/Developer/Development/pujaCircle/.github/pull_request_template.md).
- Ensure `npm run build` in `frontend/` and `npm run test:mock` pass before submitting PRs.
