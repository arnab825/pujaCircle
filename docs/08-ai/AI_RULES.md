# Explicit AI Engineering Rules - PujaCircle 🕉️

1. **Unauthenticated Marketing Pages & Contact Page Rules**:
   - Marketing pages (`/`, `/about`, `/contact`) are short, sweet, and strictly for unauthenticated guests.
   - **Contact Us page MUST NOT have a form** — it is purely an informational directory (Helpline, Email, WhatsApp, Hours, Cities).
   - Footer is compact and non-intrusive.
   - When an authenticated Devotee (`USER`) attempts to visit `/`, `/about`, `/contact`, or `/auth/*`, they MUST be automatically redirected to `/rituals`.
2. **Postal PIN Code API Integration**:
   - PIN code detection calls `https://api.postalpincode.in/pincode/{PINCODE}` via `addressApi.lookupPincode`.
   - **Devotee Registration**: Multiple post offices/localities render a dropdown for selecting the exact delivery locality; auto-fills City, District, and State.
   - **Priest Registration**: Purohit enters service base PIN code; automatically extracts and binds operating **City**, **District**, **State**, and primary service locality.
3. **Admin Priest Governance Rules**:
   - Priest management is unified under `/admin/priests` and `/admin/priests/:id`.
   - Administrator has authority to Approve, Reject, Ban, Unban/Reactivate, and Delete priest accounts.
   - Banned priests MUST be omitted from customer discovery (`/priests` and `/rituals`).
4. **Admin User Governance Rules**:
   - Administrator can view all registered devotees on the platform (`/admin/users`) with their verified contacts, regions, and booking metrics.
   - Administrator can suspend and reactivate devotee accounts.
5. **Separate Authentication Systems (No Role Selectors)**:
   - USER Auth is at `/auth/user/*`.
   - PRIEST Auth is at `/auth/priest/*`.
   - ADMIN Auth is at `/auth/admin/login` (hidden from public UI).
6. **Follow existing documentation**: `docs/` is the project's source of truth.
