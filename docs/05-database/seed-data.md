# Seed Data Strategy - PujaCircle

## 1. Seed Collections Overview

The seed data in `frontend/src/mocks/db.ts` (and future `backend/src/db/seed.ts`) contains fictional, realistic Indian data covering:

- **Users**: 2 Devotees (`Aditi Sharma`, `Rahul Verma`), 1 Administrator (`Suresh Menon`).
- **Priests**:
  - `Pandit Ramesh Shastri` (Mumbai, 18 yrs exp, Hindi/Sanskrit/Marathi, Approved).
  - `Pandit Acharya Vidyadhar Bhatt` (Bengaluru, 24 yrs exp, Kannada/Telugu/Hindi, Approved).
  - `Pandit Debasish Mukherjee` (Kolkata, 12 yrs exp, Bengali/Sanskrit, Approved).
  - `Pandit Krishnakant Upadhyay` (Gurugram, 9 yrs exp, Pending Admin Approval).
- **Rituals**: Griha Pravesh & Vastu, Satyanarayan Vrat Katha, Maha Rudrabhishek, Ganapati Havan, Annaprashan Sanskar.
- **Addresses**: Fictional addresses in Bandra West and BKC Mumbai.
- **Slots**: Morning and midday muhurat slots for testing.
- **Bookings**: Initial confirmed booking with offline payment status for reference `PC-2026-0801`.
