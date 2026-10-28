# Product Requirements Document (PRD)
## PujaCircle — Sacred Ceremony & Purohit Connection Platform

**Document Path:** `docs/PRD.md`  
**Version:** 3.0 (Full-Stack Production System)  
**Status:** Active & Implemented  

---

## 1. Executive Summary

PujaCircle is a full-stack web platform built to connect devotees across Indian cities with authentic, verified Vedic Purohits (priests). Traditional ritual booking currently suffers from opaque pricing, middleman markups, inconsistent priest knowledge, and scheduling uncertainty. 

PujaCircle resolves these challenges by introducing:
1. **Transparent Priest-Defined Pricing**: Every priest sets their own dakshina fee per ceremony.
2. **Immutable Price-Locking Snapshots**: Fees are locked into booking records upon request creation, protecting devotees from retroactive price inflation.
3. **Dynamic Exception-Based Muhurat Scheduling**: Priests configure standard working hours; availability is dynamically computed by subtracting leaves, partial blackouts, and confirmed bookings.
4. **Friction-Free Offline Cash Dakshina**: Traditional in-person cash settlement eliminates payment gateway fees, transaction failures, and complex escrow contracts.
5. **Non-Repudiable Ceremony Verification**: A secure 4-digit completion code ensures that ceremonies are verified as performed by the devotee before completion.
6. **Vetted 5-Star Reviews**: Reviews are strictly restricted to devotees who completed a verified ceremony booking.

---

## 2. Problem Statement

Across Indian urban households, organizing traditional Vedic rituals (such as Griha Pravesh, Satyanarayan Katha, Rudrabhishek, Vastu Shanti, and Vivah Sanskar) is fraught with friction:
- **Discovery Bottleneck**: Devotees rely on word-of-mouth or neighborhood contacts, often struggling to find priests proficient in specific Vedic traditions or regional languages.
- **Price Opacity**: Families face arbitrary last-minute fee demands and hidden samagri surcharges.
- **Scheduling Conflicts**: Priests juggle bookings via phone calls and paper diaries, leading to double-booking and tardiness during auspicious Muhurats.
- **Payment Gateway Friction**: High payment gateway processing fees (2-3%) and refund disputes are ill-suited for traditional ceremonial dakshina.

---

## 3. Target User Personas

### 3.1 Devotee (Grihastha / Household)
- **Profile**: Urban residents seeking authentic Vedic ceremonies for lifecycle events, festivals, new property purchases, and spiritual occasions.
- **Needs**: Clear ceremony guidelines, transparent pricing, verified priest credentials, convenient address management, and reliable Muhurat time slots.
- **Key Pain Point**: Uncertainty regarding authenticity, ritual requirements, and fair dakshina.

### 3.2 Purohit (Vedic Priest)
- **Profile**: Gurukul-trained or traditionally certified Vedic priests conducting ceremonies across urban localities.
- **Needs**: Digital schedule control, ability to set custom ceremony pricing, flexibility to block personal time/leaves, and reliable booking confirmation.
- **Key Pain Point**: Informal booking cancellations, travel schedule clashes, and lack of professional digital presence.

### 3.3 Platform Administrator
- **Profile**: Operations and quality moderation team overseeing platform integrity.
- **Needs**: Comprehensive oversight of registered priests, KYC/background vetting, user account moderation, platform KPI tracking, and sacred ceremony catalog curation.
- **Key Pain Point**: Preventing unverified or fraudulent accounts from undermining community trust.

---

## 4. User Roles & Permissions Matrix

| Platform Capability | Devotee | Purohit | Admin |
| :--- | :---: | :---: | :---: |
| Sign up & Login (Email/Password + Brevo OTP) | ✅ | ✅ | ✅ (Seeded) |
| Manage Profile & Avatar (Cloudinary) | ✅ | ✅ | ✅ |
| Save Multiple Ceremony Venue Addresses (with PIN lookup) | ✅ | ❌ | ❌ |
| Explore Sacred Puja Catalog & Ritual Guidelines | ✅ | ✅ | ✅ |
| Search Priests (by City, Language, Puja, Rating) | ✅ | ❌ | ✅ |
| Book Ceremony with Dynamic Muhurat Time Slot | ✅ | ❌ | ❌ |
| Configure Ritual Offerings & Custom Cash Dakshina (₹) | ❌ | ✅ | ❌ |
| Set Standard Daily Working Hours (e.g. 07:00 – 21:00) | ❌ | ✅ | ❌ |
| Mark Full-Day Leaves & Partial Blackout Hours | ❌ | ✅ | ❌ |
| Accept or Reject Incoming Ceremony Bookings | ❌ | ✅ | ❌ |
| Complete Ceremony via 4-Digit Completion Code | ❌ | ✅ | ❌ |
| Cancel Ceremony Booking (with Mandatory Reason) | ✅ | ✅ | ✅ |
| Submit 1–5 Star Rating & Review (Completed Bookings Only) | ✅ | ❌ | ❌ |
| Moderate Priest Applications (Approve / Reject / Ban) | ❌ | ❌ | ✅ |
| Moderate Devotee Accounts (Suspend / Unsuspend) | ❌ | ❌ | ✅ |
| Curate Sacred Puja Catalog (Create, Edit, Delete, Upload Cover) | ❌ | ❌ | ✅ |
| Access Real-Time Platform KPI & Revenue Metrics | ❌ | ❌ | ✅ |

---

## 5. Key Functional Modules

### 5.1 Authentication & Identity Verification
- Secure registration with Supabase Auth integration and 7-day internal JWT session tokens.
- Transactional 6-digit OTP delivery via Brevo (Sendinblue) HTTPS REST API for email verification and password recovery.
- Role-based route protection isolating public marketing, devotee portal, priest workspace, and admin console.

### 5.2 Dynamic Calendar & Availability Scheduling
- Priests define default daily working windows (default: 07:00 to 21:00 in Asia/Kolkata timezone).
- Exception management: priests can schedule full-day leaves and partial blackout windows (e.g., lunch, personal vidhi).
- 2-hour standard ceremony Muhurat slots are computed dynamically on the server:
  $$\text{Available Slots} = [\text{Working Window}] - [\text{Leaves}] - [\text{Blackouts}] - [\text{Confirmed Bookings}]$$

### 5.3 Ceremony Booking Lifecycle
- **Step 1 (Sankalp Creation)**: Devotee selects priest, ritual offering, date, slot, venue address, and adds special instructions.
- **Step 2 (Price Locking)**: Server snapshot-locks ritual price and cash dakshina amount. Status is set to `PENDING`.
- **Step 3 (Priest Decision)**: Priest accepts (`CONFIRMED`) or declines (`REJECTED` with reason).
- **Step 4 (Completion & Settlement)**: Devotee provides random 4-digit completion code generated at confirmation. Priest enters code to transition to `COMPLETED`. Devotee renders cash dakshina directly to the priest.
- **Step 5 (Verified Review)**: Devotee rates ceremony 1 to 5 stars with written feedback. Rating updates the priest's average score atomically.

### 5.4 Sacred Puja Catalog & Content Engine
- Admin-curated taxonomy of Vedic ceremonies categorized into *Life Event*, *Festival*, *Havan & Yagya*, *Dosha Nivaran*, and *Special Pujas*.
- Authoritative details per ceremony: deity, significance, required samagri checklist, step sequence, duration in minutes, and timing traditions.
- Direct Cloudinary media integration with strict image size guards (< 2MB).

---

## 6. Non-Functional Requirements & Design Constraints

- **Free-Tier Cloud Deployment**: Backend deploys on **Render** (free web service, zero cost), Frontend deploys on **Vercel** (free edge tier), Database runs on **Supabase** (managed PostgreSQL), and Emails route via **Brevo** (free 300 emails/day tier). No reliance on paid extensions (e.g., `pg_cron`).
- **Performance**: Client-side production bundle strictly optimized (< 380 kB main bundle), sub-200ms average backend API latency, and fast database queries via connection pooling (`postgres.js`).
- **Security & Privacy**: Strict CORS policy, Helmet security headers, Express rate-limiting guards against brute-force and OTP spam, and global error sanitization ensuring zero database internals or stack traces leak to users.
- **Accessibility & UX**: Compliant with WCAG 2.1 AA contrast standards, mobile-responsive layouts, and full support for reduced-motion preferences via Framer Motion.

---

## 7. Future Roadmap (Phase 2)
- Multi-city expansion with automated geographic proximity matching.
- Live audio/video consultation option for virtual Sankalp rituals.
- Devotee preparation checklist reminders dispatched via transactional WhatsApp/Email.
