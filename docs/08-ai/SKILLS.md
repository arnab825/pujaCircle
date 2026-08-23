# AI Agent Engineering Skills & Guidelines - PujaCircle 🕉️

> [!IMPORTANT]
> **CRITICAL MANDATE: DO NOT HALLUCINATE PROJECT REQUIREMENTS.**
>
> AI agents, assistants, and code generators working on the PujaCircle repository must strictly adhere to this guide. You MUST inspect the relevant documentation files in `docs/` before proposing, creating, or modifying any code. Documentation is the project's **SOURCE OF TRUTH**.

---

## 1. Administrative Capabilities

Platform Administrators (`ADMIN` role) have system-wide governance over:
- **Priests (`/admin/priests` & `/admin/priests/:id`)**:
  - Unified hub for reviewing applications, approved roster, and banned priests.
  - Approve, Reject, Ban, Unban/Reactivate, and Remove capabilities.
  - Banned priests are excluded from devotee search discovery.
- **Devotees / Users (`/admin/users`)**:
  - Full directory displaying names, verified channels, regions, and booking counts.
  - Suspending and reactivating devotee accounts.

---

## 2. Distinct Authentication Systems

PujaCircle strictly enforces **three separate authentication spaces**:
1. **USER AUTH (`/auth/user/*`)**: Primary customer entry point. Login with `+91 Phone + Password`.
2. **PRIEST AUTH (`/auth/priest/*`)**: Purohit portal. Login with `+91 Phone + Password`.
3. **ADMIN AUTH (`/auth/admin/login`)**: Hidden internal console. Login with `Admin Email + Password`.
