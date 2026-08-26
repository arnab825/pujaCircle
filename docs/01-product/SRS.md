# Software Requirements Specification (SRS) - PujaCircle 🕉️

## 1. System Overview & Core Principles

### 1.1 Purpose
This document provides the definitive Software Requirements Specification for the PujaCircle web application.

### 1.2 Core Domain Rules
1. **Web Only**: Responsive web application; no native mobile SDKs.
2. **Offline Direct Cash Dakshina**: All priest remunerations are settled directly in cash upon ceremony completion. No online payment gateways or commissions in Phase 1.
3. **Priest-Specific Pricing**: Price belongs to the relationship between a Purohit and a ceremony (`PriestService`), not a global platform price.
4. **Authoritative Price Snapshot**: The booking locks the priest's service price at the moment of request creation. Future price changes by the priest do not alter existing bookings.
5. **Role Isolation & Protected Routing**:
   - `USER` (Devotee): `/user/home`, `/user/priests`, `/user/priests/:id`, `/user/bookings`, `/user/bookings/:id`, `/user/addresses`, `/user/profile`.
   - `PRIEST` (Purohit): `/priest/dashboard`, `/priest/services`, `/priest/availability`, `/priest/bookings`, `/priest/profile`, `/priest/pending-approval`.
   - `ADMIN` (Administrator): `/admin/dashboard`, `/admin/priests`, `/admin/priests/:id`, `/admin/users`, `/admin/profile`.
   - `GUEST` (Public): `/`, `/about`, `/contact`, `/user/login`, `/priest/login`, `/admin/login`.
6. **5-Hour Priest Response Window**: Purohits have 5 hours from request submission to accept or decline. Unanswered requests transition to `EXPIRED` and release the slot.
7. **Verified 5-Star Reviews**: Devotees can submit a 1–5 star rating with review text **only** on ceremonies marked `COMPLETED`. Non-owners and premature ratings are strictly rejected.
8. **Purohit Approval Lifecycle**: Purohit accounts remain in `PENDING` until an administrator manually verifies credentials and approves the account from `/admin/priests`.

---

## 2. Role Access Matrix

| Route / Capability | Guest | Devotee (`USER`) | Purohit (`PRIEST`) | Admin (`ADMIN`) |
| :--- | :--- | :--- | :--- | :--- |
| **Landing (`/`)** | ✅ Marketing | ➡️ Redirect `/user/home` | ➡️ Redirect `/priest/dashboard` | ➡️ Redirect `/admin/dashboard` |
| **About (`/about`)** | ✅ Marketing | ➡️ Redirect `/user/home` | ➡️ Redirect `/priest/dashboard` | ➡️ Redirect `/admin/dashboard` |
| **Contact (`/contact`)** | ✅ Directory | ➡️ Redirect `/user/home` | ➡️ Redirect `/priest/dashboard` | ➡️ Redirect `/admin/dashboard` |
| **Devotee Portal (`/user/*`)** | ❌ (-> Login) | ✅ Full Access | ❌ (-> Dashboard) | ❌ (-> Dashboard) |
| **Priest Portal (`/priest/*`)** | ❌ (-> Login) | ❌ (-> Home) | ✅ Full Access | ❌ (-> Dashboard) |
| **Admin Console (`/admin/*`)** | ❌ (-> Login) | ❌ (-> Home) | ❌ (-> Dashboard) | ✅ Full Access |

---

## 3. Booking Status Lifecycle

```
[ PENDING ] ──(Accept)──> [ CONFIRMED ] ──(Complete Ceremony)──> [ COMPLETED ] ──(Rate)──> [ RATED ]
     │                          │
     ├──(Decline)───────────────┼──> [ REJECTED ] (Slot Released)
     ├──(5h Timeout)────────────┼──> [ EXPIRED ]  (Slot Released)
     └──(Devotee Cancels)───────┴──> [ CANCELLED ] (Slot Released)
```
