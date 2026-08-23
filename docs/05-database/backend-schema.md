# Backend Database Schema Specification - PujaCircle 🕉️

> **Source of Truth for Future Drizzle ORM Schema Implementation**

---

## 1. Custom PostgreSQL Enums

```sql
CREATE TYPE user_role AS ENUM ('USER', 'PRIEST', 'ADMIN');
CREATE TYPE priest_approval_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE slot_status AS ENUM ('AVAILABLE', 'BOOKED', 'BLOCKED');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_method AS ENUM ('OFFLINE_CASH');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID_OFFLINE');
CREATE TYPE address_label AS ENUM ('HOME', 'OFFICE', 'TEMPLE', 'OTHER');
```

---

## 2. Table Specifications

### 2.1 `users` Table
Stores authentication identity and base profiles for Devotees, Priests, and Admins.

| Column | Type | Nullable | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Primary Key, `gen_random_uuid()` | Unique user identifier |
| `full_name` | `VARCHAR(120)` | No | | Devotee or Priest full legal name |
| `phone_number`| `VARCHAR(15)` | No | UNIQUE | Indian mobile number (+91) |
| `email` | `VARCHAR(255)` | Yes | | Optional contact email |
| `role` | `user_role` | No | Default: `'USER'` | Access authorization role |
| `is_phone_verified` | `BOOLEAN` | No | Default: `false` | Phone OTP verification flag |
| `profile_image_url` | `TEXT` | Yes | | Avatar / Photo URL |
| `created_at` | `TIMESTAMPTZ` | No | Default: `NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | No | Default: `NOW()` | Last modification timestamp |

**Indexes**:
- `CREATE UNIQUE INDEX idx_users_phone ON users(phone_number);`
- `CREATE INDEX idx_users_role ON users(role);`

---

### 2.2 `priests` Table
Stores extended credential and verification profile for Vedic scholars.

| Column | Type | Nullable | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Primary Key, `gen_random_uuid()` | Priest profile ID |
| `user_id` | `UUID` | No | FK `users(id)` ON DELETE CASCADE | Associated user account |
| `display_name` | `VARCHAR(120)` | No | | Public title (e.g. Pt. Ramesh Shastri) |
| `experience_years` | `INTEGER` | No | Check: `>= 1` | Years of Vedic practice |
| `bio` | `TEXT` | No | | Vedic lineage, gurukul training |
| `languages` | `TEXT[]` | No | | Languages spoken (Hindi, Sanskrit...) |
| `specializations` | `TEXT[]` | No | | Ritual types (Griha Pravesh, Havan...) |
| `service_areas` | `TEXT[]` | No | | Urban localities covered |
| `city` | `VARCHAR(100)` | No | | Primary operating city |
| `state` | `VARCHAR(100)` | No | | Operating state |
| `approval_status` | `priest_approval_status` | No | Default: `'PENDING'` | Admin verification status |
| `dakshina_suggested` | `NUMERIC(10, 2)` | Yes | | Baseline suggested dakshina amount |
| `rating` | `NUMERIC(3, 2)` | No | Default: `5.00` | Aggregate rating |
| `review_count` | `INTEGER` | No | Default: `0` | Total review count |
| `created_at` | `TIMESTAMPTZ` | No | Default: `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | Default: `NOW()` | |

**Indexes**:
- `CREATE INDEX idx_priests_city_status ON priests(city, approval_status);`
- `CREATE INDEX idx_priests_user_id ON priests(user_id);`

---

### 2.3 `rituals` Table
Vedic ceremonies catalog.

| Column | Type | Nullable | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Primary Key, `gen_random_uuid()` | Ritual ID |
| `name` | `VARCHAR(150)` | No | | Ritual title |
| `slug` | `VARCHAR(150)` | No | UNIQUE | URL slug (e.g. `griha-pravesh`) |
| `description` | `TEXT` | No | | Significance & overview |
| `duration_minutes` | `INTEGER` | No | | Approximate time in minutes |
| `category` | `VARCHAR(100)` | No | | Category group |
| `requirements` | `TEXT[]` | No | | Essential samagri checklist |
| `suggested_dakshina`| `NUMERIC(10, 2)` | Yes | | Standard suggested amount |
| `image_url` | `TEXT` | Yes | | Ritual illustration banner |

---

### 2.4 `addresses` Table (First-Class Feature)
Devotee addresses with full Indian geographical hierarchy.

| Column | Type | Nullable | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Primary Key, `gen_random_uuid()` | Address ID |
| `user_id` | `UUID` | No | FK `users(id)` ON DELETE CASCADE | Owning devotee ID |
| `label` | `address_label` | No | Default: `'HOME'` | Address tag |
| `recipient_name` | `VARCHAR(120)` | No | | Contact person at venue |
| `phone_number` | `VARCHAR(15)` | No | | Contact phone |
| `house_building` | `VARCHAR(200)` | No | | Flat / House / Wing |
| `street` | `VARCHAR(200)` | No | | Road / Street name |
| `locality` | `VARCHAR(150)` | No | | Area / Colony |
| `landmark` | `VARCHAR(200)` | Yes | | Nearby landmark |
| `pincode` | `VARCHAR(6)` | No | | 6-digit Indian PIN code |
| `city` | `VARCHAR(100)` | No | | City |
| `district` | `VARCHAR(100)` | No | | District |
| `state` | `VARCHAR(100)` | No | | State |
| `country` | `VARCHAR(50)` | No | Default: `'India'` | Country |
| `is_default` | `BOOLEAN` | No | Default: `false` | Default selection flag |
| `created_at` | `TIMESTAMPTZ` | No | Default: `NOW()` | |

**Indexes**:
- `CREATE INDEX idx_addresses_user_id ON addresses(user_id);`
- `CREATE INDEX idx_addresses_pincode ON addresses(pincode);`

---

### 2.5 `slots` Table
Priest availability windows.

| Column | Type | Nullable | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Primary Key, `gen_random_uuid()` | Slot ID |
| `priest_id` | `UUID` | No | FK `priests(id)` ON DELETE CASCADE | Owning priest |
| `slot_date` | `DATE` | No | | Date of availability |
| `start_time` | `VARCHAR(5)` | No | Format: `HH:mm` | Slot start |
| `end_time` | `VARCHAR(5)` | No | Format: `HH:mm` | Slot end |
| `status` | `slot_status` | No | Default: `'AVAILABLE'` | Booking lock status |

**Unique Constraint**:
- `UNIQUE(priest_id, slot_date, start_time)`

---

### 2.6 `bookings` Table
Devotee ritual reservations with offline payment tracking.

| Column | Type | Nullable | Constraints / Defaults | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | No | Primary Key, `gen_random_uuid()` | Booking ID |
| `booking_reference`| `VARCHAR(30)` | No | UNIQUE | Public Ref (e.g. `PC-2026-0801`) |
| `user_id` | `UUID` | No | FK `users(id)` | Booking devotee |
| `priest_id` | `UUID` | No | FK `priests(id)` | Assigned priest |
| `ritual_id` | `UUID` | No | FK `rituals(id)` | Ceremony type |
| `address_id` | `UUID` | No | FK `addresses(id)` | Ritual venue |
| `slot_id` | `UUID` | No | FK `slots(id)` | Reserved slot |
| `booking_date` | `DATE` | No | | Date of ritual |
| `status` | `booking_status` | No | Default: `'PENDING'` | Overall booking state |
| `payment_method` | `payment_method` | No | Default: `'OFFLINE_CASH'` | Offline payment only |
| `payment_status` | `payment_status` | No | Default: `'PENDING'` | Offline cash settlement |
| `dakshina_amount` | `NUMERIC(10, 2)` | No | | Suggested dakshina |
| `special_notes` | `TEXT` | Yes | | Instructions for purohit |
| `cancellation_reason` | `TEXT` | Yes | | Provided upon cancellation |
| `cancelled_by` | `VARCHAR(20)` | Yes | `'USER' / 'PRIEST' / 'ADMIN'` | Initiator of cancellation |
| `cancelled_at` | `TIMESTAMPTZ` | Yes | | Cancellation time |
| `created_at` | `TIMESTAMPTZ` | No | Default: `NOW()` | |
| `updated_at` | `TIMESTAMPTZ` | No | Default: `NOW()` | |

**Indexes**:
- `CREATE INDEX idx_bookings_user_id ON bookings(user_id);`
- `CREATE INDEX idx_bookings_priest_id ON bookings(priest_id);`
- `CREATE INDEX idx_bookings_status ON bookings(status);`
