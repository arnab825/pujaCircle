# Edge Cases & Failure Recovery Specification - PujaCircle

## 1. Concurrency & Slot Clashes
- **Scenario**: Two devotees attempt to book the exact same priest muhurat slot simultaneously.
- **Handling**: First transaction acquires row lock, transitions status to `BOOKED`. Second transaction encounters `status !== 'AVAILABLE'` error and displays friendly toast: "This muhurat slot was just booked by another devotee. Please select another slot."

## 2. Invalid or Unserviced PIN Code
- **Scenario**: Devotee enters a 6-digit PIN code not in the database.
- **Handling**: Fallback to manual entry allowing devotee to enter City, District, and State without blocking address creation.

## 3. Priest Profile Deactivation / Rejection Post-Booking
- **Scenario**: A priest with scheduled future bookings has their approval revoked by Admin.
- **Handling**: Devotee receives proactive cancellation alert; booking status moves to `CANCELLED_ADMIN`, and devotee is prompted to rebook with another verified purohit.

## 4. Network Interruption During OTP Entry
- **Scenario**: Devotee loses internet connectivity while submitting OTP.
- **Handling**: Request timeout gracefully triggers retry prompt without resetting the entered phone number.
