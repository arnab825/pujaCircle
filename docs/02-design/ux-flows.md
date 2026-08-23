# UX Interaction Flows & Modal Architecture - PujaCircle

## 1. Modal-First Interaction Matrix

| User Action | Target Component | State / Trigger | Return State |
| :--- | :--- | :--- | :--- |
| **Sign In / Register** | `<AuthModal>` (Dialog) | User clicks "Sign In" or "Book Priest" | Updates session in `auth.store`, closes modal |
| **Add / Edit Address** | `<AddressModal>` (Dialog) | User clicks "+ Add Address" | Saves address via `address.api`, refreshes list |
| **Confirm Booking** | `<BookingConfirmModal>` (Dialog) | Devotee clicks available slot on priest profile | Transitions booking to `CONFIRMED`, triggers toast |
| **Cancel Booking** | `<AlertDialog>` | Devotee clicks "Cancel Booking" | Marks status `CANCELLED`, releases slot |
| **Admin Decision** | `<AlertDialog>` | Admin approves or rejects priest | Updates approval status in database |

---

## 2. Devotee Booking User Journey

```
[Landing Page / Search]
         ↓
[Priest Listing Page] (Filter by City, Language, Ritual)
         ↓
[Priest Profile Page]
         ↓
[Select Muhurat Slot]
         ↓
[Is Devotee Authenticated?]
      /            \
    (No)           (Yes)
     ↓               ↓
[Auth Modal: OTP]  [Booking Modal: Address & Instructions]
     ↓               ↓
[Session Saved] ────> [Confirm Booking (Offline Cash)]
                         ↓
                   [Toast Notification & Redirect to Booking Details]
```
