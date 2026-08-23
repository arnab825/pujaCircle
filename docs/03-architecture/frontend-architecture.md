# Frontend Architecture Specification - PujaCircle 🕉️

## 1. Routing & Experience Boundaries

```
[ Unauthenticated Visitor ]
  ├── Landing Page (/)
  ├── About (/about)
  ├── Contact (/contact)
  └── Auth Entry Points (/auth/user/login, /auth/priest/login, /auth/admin/login)

[ Authenticated Devotee (USER) ]
  ├── Rituals Catalog (/rituals)  [Customer Discovery Home]
  ├── Priest Directory (/priests & /priests/:id)
  ├── My Bookings (/bookings & /bookings/:id)
  ├── Saved Addresses (/addresses)
  └── Devotee Profile (/profile)
  *(Unauthenticated marketing pages /, /about, /contact, /auth/* are blocked and redirected to /rituals)*

[ Authenticated Purohit (PRIEST) ]
  └── Priest Workspace Only (/priest/dashboard, /priest/profile, /priest/availability, /priest/bookings)

[ Authenticated Platform Admin (ADMIN) ]
  └── Admin Console Only (/admin/dashboard, /admin/priests, /admin/priests/:id, /admin/users)
```

---

## 2. Postal PIN Code API & City Extraction

- **Endpoint**: `https://api.postalpincode.in/pincode/{PINCODE}`
- **Service Integration**: [address.api.ts](file:///Users/subhajit/Developer/Development/pujaCircle/frontend/src/api/address.api.ts) (`lookupPincode`).
- **Devotee Flow ([UserRegisterPage.tsx](file:///Users/subhajit/Developer/Development/pujaCircle/frontend/src/pages/auth/user/UserRegisterPage.tsx))**: Auto-detects 6-digit PIN code, offers dropdown for multiple localities, and auto-populates City, District, and State.
- **Priest Flow ([PriestRegisterPage.tsx](file:///Users/subhajit/Developer/Development/pujaCircle/frontend/src/pages/auth/priest/PriestRegisterPage.tsx))**: Purohits enter their base service PIN code; the system automatically extracts and displays their **Base City**, **District**, **State**, and allows selecting their primary service area from the dropdown.
