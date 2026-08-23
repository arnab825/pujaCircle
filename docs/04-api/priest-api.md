# Priest API Specifications - PujaCircle

## 1. Discover Priests
- **Method**: `GET`
- **Route**: `/api/v1/priests`
- **Auth**: None (Public)
- **Query Parameters**:
  - `city` (string, optional)
  - `language` (string, optional)
  - `specialization` (string, optional)
  - `searchQuery` (string, optional)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "id": "pr_mock_1",
      "fullName": "Pandit Ramesh Shastri",
      "displayName": "Pt. Ramesh Shastri",
      "experienceYears": 18,
      "bio": "Vedic scholar trained in Varanasi Gurukul...",
      "languages": ["Hindi", "Sanskrit", "Marathi"],
      "specializations": ["Grah Pravesh", "Satyanarayan Katha"],
      "serviceAreas": ["Bandra", "Andheri", "Powai"],
      "city": "Mumbai",
      "state": "Maharashtra",
      "rating": 4.9,
      "reviewCount": 84,
      "dakshinaSuggested": 3100
    }
  ]
}
```

---

## 2. Get Priest Details & Slots
- **Method**: `GET`
- **Route**: `/api/v1/priests/:id`
- **Auth**: None (Public)

---

## 3. Register as Priest
- **Method**: `POST`
- **Route**: `/api/v1/priests/register`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "fullName": "Pandit Krishnakant Upadhyay",
  "phoneNumber": "9811122334",
  "email": "krishna@example.com",
  "experienceYears": 9,
  "bio": "Practicing purohit in Shukla Yajurveda...",
  "languages": ["Hindi", "Sanskrit"],
  "specializations": ["Grah Pravesh", "Sundarkand Path"],
  "serviceAreas": ["Sector 56", "DLF Phase 4"],
  "city": "Gurugram",
  "state": "Haryana"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Priest application submitted. Phone verification and Admin review pending.",
  "data": { "id": "pr_mock_4", "approvalStatus": "PENDING" }
}
```

---

## 4. Admin Approve Priest
- **Method**: `PATCH`
- **Route**: `/api/v1/priests/:id/approve`
- **Auth**: Required (`ADMIN`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Priest approved successfully. Profile is now active.",
  "data": { "id": "pr_mock_4", "approvalStatus": "APPROVED" }
}
```
