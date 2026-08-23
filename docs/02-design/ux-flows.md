# UX Interaction Flows & Administrative Governance - PujaCircle

## 1. Unified Administrative Management Workflows

```
                               ADMIN CONSOLE (/admin/*)
                                          │
        ┌─────────────────────────────────┼─────────────────────────────────┐
        ▼                                 ▼                                 ▼
 Admin Dashboard                   Manage Priests                  Registered Devotees
(/admin/dashboard)                (/admin/priests)                  (/admin/users)
        │                                 │                                 │
  - Platform Overview               - Status Tabs: ALL, APPROVED,     - View All Devotees
  - Monthly Bookings Trend            PENDING, BANNED                 - Verified Mobile & Email
  - Pending Applications List       - Review & Approve Applications   - Primary Region & Bookings
  - Live Activity Log               - Reject Applications             - Suspend / Reactivate
                                    - Ban / Revoke Privileges
                                    - Permanent Removal
                                    - Details at /admin/priests/:id
```

---

## 2. Priest Lifecycle & Administrative State Transitions

```
[ Priest Registration ] -> Status: PENDING ADMIN APPROVAL
                                  │
                  ┌───────────────┴───────────────┐
                  ▼                               ▼
            [ REJECTED ]                    [ APPROVED ] (Active in Devotee Search)
                                                  │
                                  ┌───────────────┴───────────────┐
                                  ▼                               ▼
                             [ BANNED ]                      [ DELETED ]
                             (Revoked access)                (Permanently removed)
                                  │
                                  ▼
                         [ UNBANNED / RESTORED ] -> [ APPROVED ]
```

---

## 3. Devotee Management Workflow

- **Admin Devotee Directory (`/admin/users`)**:
  - View all devotee accounts, registration dates, contact numbers, emails, primary regions, and puja counts.
  - **Suspend Account**: Revokes booking privileges.
  - **Reactivate Account**: Restores normal devotee booking access.
