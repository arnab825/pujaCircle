# Software Requirements Specification (SRS) - PujaCircle

## 1. Introduction

### 1.1 Purpose
This document provides a comprehensive specification of functional and non-functional requirements for the PujaCircle web application.

### 1.2 Document Conventions
- **MUST / SHALL**: Mandatory requirement for Phase 1.
- **SHOULD**: High priority recommendation.
- **MAY / PHASE 2**: Deferred feature reserved for future iterations.

---

## 2. Functional Requirements (FR)

### 2.1 Authentication & User Management
- **FR-AUTH-01**: System MUST support phone number-based registration and login for Indian numbers (+91, 10 digits).
- **FR-AUTH-02**: System MUST verify phone numbers via a 6-digit OTP code before activating user sessions.
- **FR-AUTH-03**: Devotee accounts SHALL NOT require administrator approval to book rituals.
- **FR-AUTH-04**: System MUST maintain session persistence via secure HTTP-only cookies and JWT tokens (future backend).

### 2.2 Priest Management & Approval Workflow
- **FR-PRST-01**: Priest registration MUST collect full name, phone number, experience in years, languages spoken, ritual specializations, bio/lineage, and service localities.
- **FR-PRST-02**: Newly registered priests SHALL have status `PENDING` and MUST NOT appear in devotee discovery search until approved.
- **FR-PRST-03**: Platform Admin MUST have access to a review queue to approve or reject pending priest profiles.
- **FR-PRST-04**: Approved priests MUST be able to define availability slots with specific dates and start/end time windows.

### 2.3 Address Management (First-Class Feature)
- **FR-ADDR-01**: Devotees MUST be able to create, view, edit, and delete multiple addresses.
- **FR-ADDR-02**: Address fields MUST include Label (`HOME`, `OFFICE`, `TEMPLE`, `OTHER`), Recipient Name, Phone Number, House/Building, Street, Locality/Area, Landmark, PIN Code, City, District, State, and Country (default: India).
- **FR-ADDR-03**: The architecture MUST support automatic resolution of PIN code to City, District, and State via an abstracted lookup interface.
- **FR-ADDR-04**: Devotees MUST be able to designate exactly one address as the default address.

### 2.4 Ritual Discovery & Priest Booking
- **FR-BOOK-01**: Devotees MUST be able to browse cataloged rituals, viewing requirements, suggested dakshina, and estimated durations.
- **FR-BOOK-02**: Devotees MUST be able to filter priests by city, language, and ritual specialization.
- **FR-BOOK-03**: Booking a priest MUST require selecting a valid priest, ritual, saved address, and available time slot.
- **FR-BOOK-04**: Once booked, the selected time slot MUST transition to `BOOKED` to prevent duplicate overlapping bookings.
- **FR-BOOK-05**: Payment method SHALL be recorded as `OFFLINE_CASH` and initial payment status as `PENDING`.

### 2.5 Booking Cancellation
- **FR-CNCL-01**: Devotees and Priests MUST be able to cancel a scheduled booking prior to the ritual start time by providing a cancellation reason.
- **FR-CNCL-02**: Upon cancellation, the associated time slot MUST be returned to `AVAILABLE` status.

---

## 3. Non-Functional Requirements (NFR)

### 3.1 Usability & Design
- **NFR-UX-01**: The UI MUST adhere to the Modal-First principle: focused actions (Auth, Add Address, Booking Confirmation, Cancellation) MUST be presented via Dialogs/Modals or Drawers.
- **NFR-UX-02**: The theme MUST implement the spiritual modern Indian design system (Saffron, Maroon, Gold, Warm Ivory).
- **NFR-UX-03**: Responsive design MUST support Mobile (320px+), Tablet (768px+), Desktop (1024px+), and Wide screens (1440px+).

### 3.2 Security & Data Protection
- **NFR-SEC-01**: Form validation MUST be executed on both client-side and server-side using Zod schemas.
- **NFR-SEC-02**: Passwords, OTPs, and private tokens MUST never be stored in plain text or exposed in frontend bundles.
- **NFR-SEC-03**: HTTP responses MUST implement security headers via Helmet.

### 3.3 Performance & Reliability
- **NFR-PERF-01**: Frontend mock network delay MUST be configurable and default to ~350ms to simulate realistic asynchronous UX without obstructing development.
- **NFR-PERF-02**: Core Web Vitals (LCP < 2.5s, CLS < 0.1, FID/INP < 200ms) MUST be maintained.

---

## 4. Phase 1 vs. Future Phase 2 Traceability

| Feature Domain | Phase 1 (Mandatory) | Future Phase 2 |
| :--- | :--- | :--- |
| **Platform Scope** | Responsive Web Only | Multilingual UI (Regional Indian Scripts) |
| **Priest Tracking** | Static Address & Confirmed Contact | None (No GPS tracking permitted) |
| **Payment System** | Direct Offline Cash (`PAID_OFFLINE`) | Optional Advance Token UPI / Escrow |
| **E-Commerce** | None (Samagri checklist only) | Puja Samagri & Puja Kit Marketplace |
| **AI Features** | Scaffolding & Architecture Reserved | Muhurat & Astrological Recommendation AI |
