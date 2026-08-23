# Master Test Plan - PujaCircle 🕉️

## 1. Objectives

Verify the functional correctness, responsiveness, and state transitions of the PujaCircle platform across:
1. User phone OTP authentication.
2. Address book CRUD and PIN code auto-resolution.
3. Priest catalog filtering, profile inspection, and slot scheduling.
4. Booking creation with offline cash payment tracking.
5. Booking cancellation and slot release state machine.
6. Priest onboarding and admin verification workflow.

---

## 2. Test Suites Matrix

| Suite | Scope | Execution Method | Target Pass Criteria |
| :--- | :--- | :--- | :--- |
| **Mock API Suite** | In-memory CRUD, latency, state machines | `npm run test:mock` | 100% pass |
| **Type Check & Build** | TypeScript strictness & Vite bundling | `npm run build` | Zero TS/bundling errors |
| **Responsive UX Audit** | Breakpoint layouts, drawers & dialogs | Manual / Browser tools | Mobile & Desktop seamless |
| **Accessibility Audit**| Keyboard navigation, ARIA dialogs | Automated / Screen reader | WCAG 2.1 AA compliance |
