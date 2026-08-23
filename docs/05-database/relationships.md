# Entity Relationships & Cardinalities - PujaCircle

| Source Entity | Target Entity | Cardinality | Relationship Description |
| :--- | :--- | :--- | :--- |
| `users` | `addresses` | 1 : N (One to Many) | A devotee can store multiple addresses (home, office, temple). Exactly one is designated default. |
| `users` | `priests` | 1 : 1 (One to One) | A user with role `PRIEST` has exactly one extended priest profile. |
| `users` | `bookings` | 1 : N (One to Many) | A devotee can schedule multiple ritual bookings over time. |
| `priests` | `slots` | 1 : N (One to Many) | A priest schedules multiple availability windows across days. |
| `priests` | `bookings` | 1 : N (One to Many) | A priest receives and performs multiple bookings. |
| `rituals` | `bookings` | 1 : N (One to Many) | A ritual type is referenced by multiple bookings. |
| `addresses` | `bookings` | 1 : N (One to Many) | An address serves as the venue for multiple scheduled ceremonies. |
| `slots` | `bookings` | 1 : 1 (One to One) | A specific slot is reserved for exactly one confirmed booking. |
