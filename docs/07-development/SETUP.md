# Developer Setup & Local Environment Guide 🛠️

Welcome to the **PujaCircle Local Development Setup Guide**. Follow these straightforward steps to set up, run, and test the project locally.

---

## 1. Prerequisites

Make sure you have the following installed on your machine:
- **Node.js**: v18.0.0 or higher (Check with `node -v`)
- **npm**: v9.0.0 or higher (Check with `npm -v`)
- **Git**: (Check with `git --version`)

---

## 2. Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/pujaCircle.git
cd pujaCircle
```

### Step 2: Install Workspace Dependencies
Run from the root directory:
```bash
npm run install:all
```
*Alternatively, you can navigate to the frontend directory directly:*
```bash
cd frontend
npm install
```

---

## 3. Running the Project Locally

### Start Frontend Development Server
From the root directory:
```bash
npm run dev
```
*Or from `frontend/`:*
```bash
cd frontend
npm run dev
```

The application will start on **`http://localhost:5173`**.

---

## 4. Test Accounts for Local Testing

The mock database is pre-seeded with realistic test accounts for each role:

| Role | Identifier | Password | Default Landing Page |
| :--- | :--- | :--- | :--- |
| **Devotee (`USER`)** | `+919876543210` | `User@123` *(OTP: `123456`)* | `/user/home` |
| **Purohit (`PRIEST`)** | `+919876501234` | `Priest@123` *(OTP: `123456`)* | `/priest/dashboard` |
| **Admin (`ADMIN`)** | `admin@pujacircle.demo` | `Admin@123` | `/admin/dashboard` |

---

## 5. Automated Verification & Test Commands

PujaCircle includes automated test suites to ensure data integrity and business rule compliance.

### Run Domain & Error Handling Test Suite
```bash
cd frontend
npm run test:mock
```
Runs 77 automated tests verifying:
- Authentication & schema validation
- Address & PIN code lookup
- Priest service management & price snapshotting
- Booking lifecycle state transitions
- Admin approval & ban workflows
- Error sanitization & sensitive pattern leak prevention

### Run TypeScript Typecheck
```bash
cd frontend
npm run typecheck
```

### Build Production Bundle
```bash
cd frontend
npm run build
```

---

## 6. Project Scripts Summary

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts local development server with instant HMR |
| `npm run build` | `tsc && vite build` | Typechecks and compiles production-ready bundle |
| `npm run test:mock` | `tsx src/mocks/test-mock-api.ts` | Runs the 77+ automated domain validation test suite |
| `npm run preview` | `vite preview` | Previews the compiled production build locally |

---

## 7. Common Troubleshooting Tips

1. **Port 5173 Already in Use**:
   Vite will automatically offer the next port (e.g. `5174`).
2. **Missing Dependencies**:
   Delete `node_modules` and run `npm install` inside `frontend/`.
3. **Resetting Mock Data**:
   The mock database in memory automatically resets to fresh seed data on server reload.
