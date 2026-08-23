# User Profile API Specifications - PujaCircle

## 1. Get Profile
- **Method**: `GET`
- **Route**: `/api/v1/users/profile`
- **Auth**: Required (`USER`, `PRIEST`, or `ADMIN`)
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "usr_mock_1",
    "fullName": "Aditi Sharma",
    "phoneNumber": "9876543210",
    "email": "aditi.sharma@example.com",
    "role": "USER",
    "isPhoneVerified": true,
    "createdAt": "2026-01-10T10:00:00.000Z"
  }
}
```

---

## 2. Update Profile
- **Method**: `PATCH`
- **Route**: `/api/v1/users/profile`
- **Auth**: Required
- **Request Body**:
```json
{
  "fullName": "Aditi S. Sharma",
  "email": "aditi.new@example.com"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "usr_mock_1",
    "fullName": "Aditi S. Sharma",
    "email": "aditi.new@example.com"
  }
}
```
