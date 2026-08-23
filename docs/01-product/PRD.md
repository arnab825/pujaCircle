# Product Requirements Document (PRD) - PujaCircle 🕉️

> **Tagline**: *"Traditional rituals, made easier for modern India."*

---

## 1. Executive Summary & Product Vision

**PujaCircle** is a specialized, web-only platform designed to resolve the difficulties modern Indian urban households face when organizing religious pujas, havans, housewarmings (Griha Pravesh), and lifecycle ceremonies (Sanskars). By creating a trusted, transparent marketplace connecting verified Vedic priests (purohits) with devotees, PujaCircle preserves cultural sanctity while providing modern scheduling convenience.

---

## 2. Problem Statement

1. **Information Asymmetry & Trust Deficit**: Urban residents in Tier-1/Tier-2 Indian cities often lack local family networks or temple connections to locate verified, authentic Vedic scholars.
2. **Scheduling Friction**: Coordinating dates, muhurat timings, and samagri requirements through informal phone calls leads to confusion and missed auspicious windows.
3. **Location & Language Mismatch**: Finding priests who speak specific regional languages (e.g., Bengali, Tamil, Telugu, Marathi, Kannada) and follow specific sampradayas in cosmopolitan cities is difficult.
4. **Opaque Pricing & Expectations**: Traditional ritual arrangements often lack clear upfront expectations regarding duration, samagri preparation, and suggested dakshina.

---

## 3. Target Audience

- **Primary User (Devotees / Grihasthas)**: Working urban professionals, young families moving into new homes, and diaspora returnees seeking authentic Vedic ceremonies.
- **Secondary User (Vedic Priests / Purohits)**: Independent purohits and temple scholars looking to reach devotees systematically across urban localities.
- **Platform Administrator**: Operational team verifying purohit credentials, Vedic lineage, and managing platform integrity.

---

## 4. Scope (Phase 1 / Minor Focus)

### In-Scope:
- **Devotee Flow**:
  - Phone OTP registration & authentication (+91 Indian mobile).
  - Devotee profile management.
  - Multi-address management with PIN code auto-lookup and default selection.
  - Discovery of verified priests filtered by city, language, and ritual specialization.
  - Ritual catalog browsing with detailed requirements and approximate durations.
  - Muhurat slot selection and booking confirmation.
  - Booking history and straightforward cancellation.
- **Priest Flow**:
  - Priest registration with experience, Vedic background, languages, and service areas.
  - Phone OTP verification.
  - Admin approval workflow (priest account remains pending until manual admin approval).
  - Priest profile and availability slot management.
  - Devotee booking request review with devotee address details.
- **Admin Flow**:
  - Verification queue for pending priests with approve/reject actions.
  - System-wide booking and user monitoring.
- **Payment & UX Principles**:
  - **Offline Dakshina Only**: Priests receive payments directly from devotees in offline cash. Payment status tracked as `PENDING` / `PAID_OFFLINE`.
  - **Modal-First UX**: Focused actions (login, OTP, address create/edit, booking confirmation) utilize dialogs/drawers.

---

## 5. Non-Goals & Hard Product Constraints

> [!CAUTION]
> The following items are strictly out of scope for Phase 1:

1. **NO Mobile App**: Web-only responsive design. No React Native, Flutter, iOS, or Android apps.
2. **NO Live Priest Tracking**: No GPS real-time location or driver-style tracking.
3. **NO Online Priest Payments**: No Razorpay, Stripe, or UPI gateway integration in Phase 1.
4. **NO E-Commerce / Samagri Kits**: Puja item purchase and delivery is deferred to Phase 2.
5. **NO Unverified Priests**: Priests cannot accept bookings without explicit admin approval.

---

## 6. Phase 2 Roadmap

- Puja Samagri & Kit E-Commerce integration.
- Astrological Kundali & Muhurat AI recommendation assistant.
- Multilingual regional language UI localization (Hindi, Tamil, Telugu, Bengali, Kannada, Marathi).
- Priest calendar two-way synchronization.
- Post-ceremony review and rating submissions.

---

## 7. Success Criteria & Metrics

| Metric | Target (Phase 1) | Measurement |
| :--- | :--- | :--- |
| **Priest Onboarding Quality** | 100% verified credentials | Admin verification audit |
| **Booking Completion Rate** | > 85% without cancellation | Booking status transitions |
| **Address Setup Completion** | < 45 seconds | PIN code auto-detection efficiency |
| **Platform Responsiveness** | < 500ms TTFB | Synthetic & real-user monitoring |
