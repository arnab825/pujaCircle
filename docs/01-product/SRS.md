# Software Requirements Specification (SRS) - PujaCircle 🕉️

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive specification of functional and non-functional requirements for the PujaCircle web application.

### 1.2 Frontend Skeleton Architecture & Mock Data Single Source of Truth
The frontend is structured as a **frozen blueprint of RAFCE-style skeleton components**:
- Every page is a clean React functional component with detailed specification comments (`PAGE`, `ACCESS`, `PURPOSE`, `FUTURE CONTENT`, `DATA SOURCE`, `VALIDATION`).
- All frontend mock datasets (users, priests, rituals, addresses, slots, bookings, PIN codes, dashboard stats) reside in the **single centralized mock database** (`@/mocks/db.ts`).
- Pages do not implement heavy ad-hoc feature logic directly; feature development proceeds iteratively connecting skeleton pages to API services.

### 1.3 Role Isolation & Authentication Model
PujaCircle strictly maintains **three separate authentication systems with full role isolation**:

1. **Devotee (USER) Auth (`/auth/user/*`)**:
   - **Login (`/auth/user/login`)**: Uses **+91 Mobile Number + Password**.
   - **Registration (`/auth/user/register`)**: Verifies Mobile Number (Phone OTP: `123456`) and Email (Email OTP: `123456`), collects mandatory address with PIN-code location auto-detection, and immediately logs in to `/` (Customer website).
   - **Forgot Password (`/auth/user/forgot-password`)**: Uses **Email -> Email OTP -> New Password**.
2. **Purohit (PRIEST) Auth (`/auth/priest/*`)**:
   - **Login (`/auth/priest/login`)**: Uses **+91 Mobile Number + Password**, redirects directly to `/priest/dashboard`.
   - **Registration (`/auth/priest/register`)**: Verifies Mobile Number (Phone OTP) and Email (Email OTP), collects Vedic credentials, and submits application with status `PENDING ADMIN APPROVAL`.
   - **Forgot Password (`/auth/priest/forgot-password`)**: Uses **Email -> Email OTP -> New Password**.
3. **Platform Administrator (ADMIN) Console (`/admin/*`)**:
   - **Private / Hidden Console (`/auth/admin/login`)**: Does NOT appear in public navigation, footer, or public forms.
   - **Manage Priests (`/admin/priests` & `/admin/priests/:id`)**:
     - Unified hub for reviewing applications, active roster, and banned priests.
     - **Approve / Reject** initial scholar applications.
     - **Ban Account** (revokes login access; omits priest from search discovery).
     - **Unban / Reactivate** priest accounts back to Approved.
     - **Remove / Delete** priest accounts permanently.
   - **Devotee Directory (`/admin/users`)**:
     - Complete platform registry of all registered devotees, verified mobile/email channels, primary regions, and booking metrics.
     - **Suspend / Reactivate** devotee accounts.

---

## 2. Role Access Matrix

| Route | Visitor (Logged Out) | USER | PRIEST | ADMIN |
| :--- | :--- | :--- | :--- | :--- |
| **Landing (`/`)** | YES (Marketing) | YES (Customer) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **About / Contact** | YES | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **User Sign In (`/auth/user/login`)** | YES | NO (-> `/`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Priest Sign In (`/auth/priest/login`)** | YES | NO (-> `/`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Admin Sign In (`/auth/admin/login`)** | YES | NO (-> `/`) | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Rituals (`/rituals`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Priests (`/priests`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Bookings (`/bookings`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Addresses (`/addresses`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Profile (`/profile`)** | NO (-> `/auth/user/login`) | YES | NO (-> `/priest/dashboard`) | NO (-> `/admin/dashboard`) |
| **Priest Workspace (`/priest/*`)** | NO (-> `/auth/priest/login`) | NO (-> `/`) | YES | NO (-> `/admin/dashboard`) |
| **Admin Workspace (`/admin/*`)** | NO (-> `/auth/admin/login`) | NO (-> `/`) | NO (-> `/priest/dashboard`) | YES |
