# Complete Application Flow Diagrams - PujaCircle 🕉️

## 1. Visitor & Devotee Booking Journey

```mermaid
graph TD
    Start([Visitor lands on Homepage]) --> Discovery[Browse Priests / Rituals]
    Discovery --> Filters[Filter by City, Language, or Puja Type]
    Filters --> PriestProfile[View Priest Profile & Credentials]
    PriestProfile --> SelectSlot[Select Available Muhurat Slot]
    
    SelectSlot --> CheckAuth{Is Devotee Signed In?}
    CheckAuth -- No --> AuthModal[Open Auth Modal -> Enter Indian Phone + OTP]
    AuthModal --> Verified[Phone Verified & Session Initialized]
    Verified --> AddressCheck
    CheckAuth -- Yes --> AddressCheck{Has Saved Address?}
    
    AddressCheck -- No --> AddressModal[Open Address Modal -> Enter PIN & Venue Details]
    AddressModal --> ConfirmModal[Open Booking Confirmation Modal]
    AddressCheck -- Yes --> ConfirmModal
    
    ConfirmModal --> Review[Review Date, Muhurat Slot, Address & Offline Dakshina]
    Review --> ClickConfirm[Confirm Puja Booking]
    ClickConfirm --> Booked[Slot status -> BOOKED, Booking status -> CONFIRMED]
    Booked --> BookingDetails[Redirect to Booking Details Page with Priest Contact]
```

---

## 2. Priest Onboarding & Admin Verification Flow

```mermaid
graph TD
    PStart([Priest visits Priest Portal]) --> PRegister[Fills Registration: Experience, Languages, Lineage]
    PRegister --> POTP[Verifies Mobile via 6-digit OTP]
    POTP --> PPending[Account Status -> PENDING]
    
    PPending --> AdminQueue[Appears in Admin Verification Queue]
    AdminQueue --> AdminReview[Admin inspects credentials & Vedic background]
    
    AdminReview --> AdminDecision{Admin Decision}
    AdminDecision -- Reject --> PRejected[Status -> REJECTED (Notification sent)]
    AdminDecision -- Approve --> PApproved[Status -> APPROVED]
    
    PApproved --> PDashboard[Priest Dashboard Activated]
    PDashboard --> AddSlots[Priest creates Muhurat Availability Slots]
    AddSlots --> PublicVisible[Priest & Slots become visible in public search]
```

---

## 3. Devotee Profile, Address & Cancellation Management

```mermaid
graph TD
    UserStart([Devotee logs into Dashboard]) --> Dashboard[User Dashboard]
    
    Dashboard --> Tab1[Addresses Management]
    Tab1 --> AddAddr[Add New Address / Auto-detect PIN]
    Tab1 --> SetDef[Set Address as Default]
    Tab1 --> DelAddr[Delete Unused Address]
    
    Dashboard --> Tab2[Bookings History]
    Tab2 --> ViewDetails[View Booking Details & Venue]
    ViewDetails --> CancelBooking[Cancel Scheduled Booking]
    CancelBooking --> ReasonModal[Submit Cancellation Reason]
    ReasonModal --> ReleaseSlot[Booking marked CANCELLED -> Slot returned to AVAILABLE]
```
