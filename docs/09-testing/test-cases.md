# Test Cases Specification - PujaCircle

## 1. Authentication Test Cases
- **TC-AUTH-01**: User enters valid 10-digit mobile number -> OTP sent successfully.
- **TC-AUTH-02**: User enters invalid 8-digit mobile number -> Client validation error displayed.
- **TC-AUTH-03**: User enters valid 6-digit OTP (`123456`) -> Session initialized, user set in `auth.store`.

## 2. Address Test Cases
- **TC-ADDR-01**: User creates address with valid PIN `400050` -> City (Mumbai) & State (Maharashtra) auto-filled.
- **TC-ADDR-02**: User marks new address as default -> Previous default address is updated to `isDefault: false`.
- **TC-ADDR-03**: User edits house/building details -> Changes persist in address list.
- **TC-ADDR-04**: User deletes an address -> Address removed from list.

## 3. Booking Test Cases
- **TC-BOOK-01**: Devotee selects available slot and confirms -> Booking reference generated (e.g. `PC-2026-0801`), slot status transitions to `BOOKED`.
- **TC-BOOK-02**: Devotee attempts to book an already `BOOKED` slot -> System throws error: "Slot already booked".
- **TC-BOOK-03**: Devotee cancels booking with reason -> Booking status becomes `CANCELLED`, slot status reverts to `AVAILABLE`.

## 4. Priest & Admin Test Cases
- **TC-PRST-01**: Priest registers with valid credentials -> Account status set to `PENDING`.
- **TC-ADMIN-01**: Admin approves pending priest -> Priest status becomes `APPROVED` and appears in public discovery.
- **TC-ADMIN-02**: Admin rejects pending priest -> Priest status becomes `REJECTED`.
