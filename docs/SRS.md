# Software Requirements Specification (SRS)
## PujaCircle — Sacred Ceremony & Purohit Connection Platform

**Document Path:** `docs/SRS.md`  
**Version:** 3.0 (Full-Stack Production System)  
**Status:** Active & Implemented  

---

## 1. Scope & Purpose

This Software Requirements Specification (SRS) defines the formal functional and non-functional requirements for the **PujaCircle** full-stack web platform. It establishes the authoritative technical contract governing the React 19 frontend single-page application, Express.js backend REST API, Drizzle ORM PostgreSQL database layer, Supabase authentication provider, Brevo transactional email engine, and Cloudinary media cloud service.

---

## 2. System Actors & User Personas

1. **Devotee (Grihastha)**: Unauthenticated visitor or registered user who discovers ceremonies, books verified priests, saves ceremony venues, and renders offline cash dakshina.
2. **Purohit (Vedic Priest)**: Gurukul-trained or traditionally certified ritual practitioner who configures ceremony offerings, custom pricing, working hours, and confirms ceremony completion via a 4-digit code.
3. **Platform Administrator**: Operational moderator who reviews priest onboarding applications, moderates user accounts, curates the sacred puja catalog, and monitors platform-wide ceremony bookings and KPIs.

---

## 3. Specific Functional Requirements

### 3.1 Authentication & Session Management
- **FR-AUTH-1 (Dual Registration)**: The system shall provide distinct registration endpoints for Devotees (`/api/v1/auth/register/user`) and Purohits (`/api/v1/auth/register/priest`). Devotees become active immediately; Purohits are assigned `PENDING` approval status awaiting admin verification.
- **FR-AUTH-2 (Identity Provider Integration)**: User authentication credentials shall be managed via Supabase Auth with passwords securely hashed.
- **FR-AUTH-3 (Session Tokens)**: Upon successful authentication, the system shall issue an internal application JWT with a 7-day lifespan, returned in the response payload and set as an HTTP-only secure cookie.
- **FR-AUTH-4 (Transactional OTP Delivery)**: The system shall dispatch 6-digit one-time passkeys (OTPs) via Brevo's HTTPS REST API for email verification and password recovery. OTPs shall have a strict 10-minute validity period.
- **FR-AUTH-5 (Password Recovery)**: The system shall allow users to request password recovery (`/api/v1/auth/forgot-password`) and reset their credentials (`/api/v1/auth/reset-password`) using a valid 6-digit OTP.
- **FR-AUTH-6 (Account Moderation Enforcement)**: If a user's `accountStatus` is set to `BANNED`, the authentication middleware (`requireAuth`) shall immediately reject requests with HTTP 403 and display the administrative ban reason.

### 3.2 Devotee Venue Address Management
- **FR-ADDR-1 (Multiple Venue Addresses)**: The system shall allow devotees to save, edit, and delete multiple ceremony venue addresses (e.g., Home, Ancestral Home, Temple, Office).
- **FR-ADDR-2 (Default Address Assignment)**: Devotees shall be able to mark a specific address as their default venue (`PATCH /api/v1/addresses/:id/default`).
- **FR-ADDR-3 (Postal PIN Resolution)**: The system shall provide an automated postal lookup (`GET /api/v1/geo/pincode/:pincode`) resolving locality, city, district, and state from 6-digit Indian PIN codes.

### 3.3 Priest Directory & Service Configuration
- **FR-PRIEST-1 (Public Discovery)**: The system shall expose a public search endpoint (`GET /api/v1/priests`) allowing devotees to filter approved priests by city, language, puja offering, and rating with pagination support.
- **FR-PRIEST-2 (Detailed Profile View)**: The system shall provide complete priest profiles (`GET /api/v1/priests/:id`) displaying experience years, bio, Vedic lineages, languages, specializations, ratings, and active ceremony offerings.
- **FR-PRIEST-3 (Custom Service Offerings)**: Priests shall be able to configure specific puja ceremonies with custom cash dakshina amounts in Indian Rupees (`POST /api/v1/priests/me/services`).
- **FR-PRIEST-4 (Service Active Toggle)**: Priests shall be able to toggle the availability status of individual ceremony offerings on or off.

### 3.4 Exception-Based Muhurat Scheduling
- **FR-AVAIL-1 (Standard Working Hours)**: Priests shall configure standard daily working hours (default: 07:00 to 21:00 in Asia/Kolkata timezone).
- **FR-AVAIL-2 (Full-Day Leaves)**: Priests shall be able to mark specific dates as full-day off (`POST /api/v1/availability/day-off`). The system shall reject requests if confirmed ceremony bookings already exist on that date.
- **FR-AVAIL-3 (Partial Blackout Hours)**: Priests shall be able to block specific hour windows on any date (`POST /api/v1/availability/block-hours`). The schema shall strictly enforce that `endTime > startTime`.
- **FR-AVAIL-4 (Dynamic Slot Generation)**: The system shall dynamically generate 2-hour Muhurat slots for booking by subtracting leaves, blackouts, and confirmed bookings from the priest's active working window.
- **FR-AVAIL-5 (Calendar Grid API)**: The system shall provide a 3-month availability status overview (`GET /api/v1/availability/calendar`) returning status flags (`AVAILABLE`, `FULL_DAY_OFF`, `PARTIAL_BLOCK`).

### 3.5 Ceremony Booking Lifecycle
- **FR-BOOK-1 (Request Submission)**: Devotees shall submit ceremony booking requests specifying priest, ritual offering, date, time slot, venue address, and optional instructions.
- **FR-BOOK-2 (Immutable Price Snapshot)**: Upon booking creation, the server shall lock the ritual price and total amount into `servicePrice` and `totalPrice`. Subsequent price changes by the priest shall never alter existing bookings.
- **FR-BOOK-3 (Unique Reference Code)**: Every booking shall be assigned a unique, human-readable reference code formatted as `PC-YYYY-XXXXXX` (e.g., `PC-2026-AB12CD`).
- **FR-BOOK-4 (Acceptance & Completion Code Generation)**: When a priest accepts a booking (`POST /api/v1/bookings/:id/accept`), status changes to `CONFIRMED` and the server generates a cryptographically random 4-digit completion code.
- **FR-BOOK-5 (Rejection with Reason)**: Priests shall be able to reject a booking (`POST /api/v1/bookings/:id/reject`) accompanied by a mandatory explanation.
- **FR-BOOK-6 (Cancellation)**: Devotees or priests shall be able to cancel confirmed bookings prior to ceremony execution (`POST /api/v1/bookings/:id/cancel`) with an audited reason and actor tag.
- **FR-BOOK-7 (Code-Verified Completion)**: Upon completing the ritual vidhi, the priest enters the 4-digit code provided by the devotee (`POST /api/v1/bookings/:id/complete`). The system validates the code before transitioning status to `COMPLETED`.
- **FR-BOOK-8 (Offline Cash Dakshina)**: Settlement is executed offline in cash directly between devotee and priest. `paymentMethod` is fixed to `OFFLINE_CASH` and transitions to `PAID_OFFLINE` upon ceremony completion.

### 3.6 Verified Reviews & Ratings
- **FR-REV-1 (Strict Review Guard)**: Ratings (1–5 stars) and written reviews may only be submitted for bookings that have reached `COMPLETED` status.
- **FR-REV-2 (Single Review Submission)**: A devotee may only rate a booking once. Duplicate review submissions on the same booking shall be rejected with HTTP 400.
- **FR-REV-3 (Atomic Score Calculation)**: When a review is submitted, the system shall atomically update the priest's aggregate rating and review count in `priest_profiles`.

### 3.7 Platform Administration & Quality Moderation
- **FR-ADMIN-1 (Role Guard)**: All administrative endpoints under `/api/v1/admin/*` shall strictly enforce the `ADMIN` role via `requireAdmin` middleware.
- **FR-ADMIN-2 (Priest Vetting)**: Administrators shall view pending priest applications and execute `approve`, `reject`, `ban`, `unban`, or `reopen` actions.
- **FR-ADMIN-3 (Devotee Moderation)**: Administrators shall be able to suspend (`POST /api/v1/admin/users/:id/suspend`) or unsuspend devotee accounts with mandatory audited reasons.
- **FR-ADMIN-4 (KPI Dashboard)**: The system shall aggregate platform metrics (`GET /api/v1/admin/dashboard/stats`) including total devotees, active users, approved priests, pending priests, confirmed bookings, completed bookings, and estimated total revenue.
- **FR-ADMIN-5 (Ceremony Catalog Curation)**: Administrators shall have full CRUD permissions on the sacred puja catalog (`/api/v1/catalog`), including deities, duration in minutes, samagri requirements, steps, and cover image uploads.

### 3.8 Media Cloud Storage
- **FR-MEDIA-1 (Cloudinary Uploads)**: Media uploads shall be processed via Cloudinary direct signed upload parameters (`GET /api/v1/media/signature`) or direct server-side upload (`POST /api/v1/media/upload`).
- **FR-MEDIA-2 (Strict File Size Limit)**: Image uploads shall be strictly enforced under 2 megabytes (2MB). Payloads exceeding 2MB shall be rejected with HTTP 400.
- **FR-MEDIA-3 (Automated Asset Cleanup)**: When a catalog cover image is updated or deleted, the system shall automatically purge the previous asset from Cloudinary storage.

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Efficiency (NFR-PERF)
- **NFR-PERF-1**: Backend REST endpoints shall respond within 200 milliseconds under normal operating loads.
- **NFR-PERF-2**: Production frontend JavaScript main chunk size shall remain under 400 kB (current: 374.5 kB) to ensure fast initial page loads on mobile networks.
- **NFR-PERF-3**: Database queries shall utilize indexed foreign keys and connection pooling (`postgres.js` pool size: 10, idle timeout: 20s).

### 4.2 Security & Error Sanitization (NFR-SEC)
- **NFR-SEC-1**: The application shall implement security headers via Helmet (frameguard, XSS protection, MIME sniffing protection).
- **NFR-SEC-2**: The API shall implement tiered rate-limiting:
  - General API: 300 requests per 15-minute window per IP.
  - Authentication routes: 30 requests per 15-minute window per IP.
  - OTP verification: 5 requests per 10-minute window per IP.
- **NFR-SEC-3**: Global error sanitization shall prevent internal file paths, stack traces, or raw SQL errors from leaking to API responses.

### 4.3 Architecture & MVC Structure (NFR-ARCH)
- **NFR-ARCH-1**: Backend code shall adhere to the MVC design pattern with clear separation of concerns (Models, Views/ViewModels, Controllers, Services, Repositories, Routes).
- **NFR-ARCH-2**: End-to-end type safety shall be enforced with TypeScript strict mode enabled across both frontend and backend repositories.
- **NFR-ARCH-3**: All incoming HTTP payloads (body, query, params) shall be validated against strict Zod schemas before reaching business logic controllers.

### 4.4 Accessibility & Motion (NFR-A11Y)
- **NFR-A11Y-1**: All visual elements shall comply with WCAG 2.1 AA color contrast standards.
- **NFR-A11Y-2**: Animations managed by Framer Motion shall respect the user's `prefers-reduced-motion` operating system preference via `MotionProvider`.

### 4.5 Free-Tier Deployment Compatibility (NFR-DEPLOY)
- **NFR-DEPLOY-1**: The platform shall run completely on free cloud tiers:
  - Frontend: Vercel (Hobby Tier).
  - Backend: Render (Free Web Service).
  - Database & Auth: Supabase (Free Tier).
  - Transactional Emails: Brevo HTTPS REST API (Free Tier: 300 emails/day).
- **NFR-DEPLOY-2**: The system shall not depend on paid database extensions (e.g., `pg_cron`).
