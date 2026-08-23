# Explicit AI Engineering Rules - PujaCircle 🕉️

1. **Admin Priest Governance Rules**:
   - Priest management is unified under `/admin/priests` and `/admin/priests/:id`.
   - Administrator has authority to Approve, Reject, Ban, Unban/Reactivate, and Delete priest accounts.
   - Banned priests MUST be omitted from customer discovery (`/priests` and `/rituals`).
2. **Admin User Governance Rules**:
   - Administrator can view all registered devotees on the platform (`/admin/users`) with their verified contacts, regions, and booking metrics.
   - Administrator can suspend and reactivate devotee accounts.
3. **Separate Authentication Systems (No Role Selectors)**:
   - USER Auth is at `/auth/user/*`.
   - PRIEST Auth is at `/auth/priest/*`.
   - ADMIN Auth is at `/auth/admin/login` (hidden from public UI).
4. **Follow existing documentation**: `docs/` is the project's source of truth.
