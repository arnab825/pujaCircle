# Database Architecture & Constraints Reference - PujaCircle

## 1. Primary & Foreign Key Conventions

- All table primary keys MUST use `UUID` generated via `gen_random_uuid()`.
- Foreign key relations enforce referential integrity:
  - `addresses.user_id` -> `users.id` (`ON DELETE CASCADE`)
  - `priests.user_id` -> `users.id` (`ON DELETE CASCADE`)
  - `slots.priest_id` -> `priests.id` (`ON DELETE CASCADE`)
  - `bookings.user_id` -> `users.id` (`ON DELETE RESTRICT`)
  - `bookings.priest_id` -> `priests.id` (`ON DELETE RESTRICT`)
  - `bookings.slot_id` -> `slots.id` (`ON DELETE RESTRICT`)

---

## 2. Integrity & Concurrency Rules

- **Time Slot Race Conditions**: When a booking is confirmed, a transaction locks the slot row (`SELECT ... FOR UPDATE`), verifies `status = 'AVAILABLE'`, and transitions it to `BOOKED` before inserting into `bookings`.
- **Default Address Guarantee**: When `is_default` is set to `true` on an address insert or update, all other addresses belonging to that `user_id` are reset to `is_default = false` in the same transaction.
