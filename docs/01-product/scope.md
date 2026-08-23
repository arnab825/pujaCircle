# Scope & Boundary Matrix - PujaCircle

## Overview

This document serves as an unambiguous architectural boundary reference for engineers and AI agents working on PujaCircle.

---

## 1. Feature Matrix

| Feature | Phase 1 Status | Boundary Rules |
| :--- | :--- | :--- |
| **Platform Target** | Web Only | React 19 + Vite + Tailwind. No React Native or mobile binaries. |
| **User Onboarding** | Included | Indian Mobile (+91) OTP verification. Devotees self-activate immediately. |
| **Priest Onboarding** | Included | Phone OTP + Admin Approval Workflow. Priests remain pending until approved. |
| **Address Book** | Included (Core) | Comprehensive Indian address schema, PIN code lookup abstraction, default flags. |
| **Priest Discovery** | Included | Filterable by city, language, and ritual specialization. |
| **Ritual Catalog** | Included | Information only (approximate duration, samagri list, suggested dakshina). |
| **Slot Booking** | Included | Selection of available muhurat slot, status transition to `BOOKED`. |
| **Payment Handling** | Offline Cash Only | `paymentMethod = OFFLINE_CASH`. No Razorpay/Stripe SDK integration. |
| **Priest Tracking** | Disabled | No GPS, driver tracking, or real-time maps. |
| **Samagri E-Commerce** | Disabled | No cart, checkout, or product inventory. Deferred to Phase 2. |
| **AI Assistants** | Scaffolded | Architectural interfaces reserved; no random AI features in Phase 1. |

---

## 2. Technical Boundary Rules for Development

1. **Frontend Mock Rule**: The frontend mock system (`src/mocks/`) must remain functional until backend integration is explicitly mandated. React components interact with `src/api/*.api.ts` rather than calling `mockDb` directly.
2. **Backend Scaffold Rule**: Backend source files are structural skeletons. Do not implement controllers, Drizzle ORM queries, or authentication middleware logic during the initial scaffolding phase.
3. **Documentation Precedence**: If code behavior conflicts with `docs/`, the documentation is the source of truth. Developers must update or consult documentation before modifying contracts.
