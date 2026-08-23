# Auth API Specifications - PujaCircle

## 1. Send OTP
- **Method**: `POST`
- **Route**: `/api/v1/auth/send-otp`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "phoneNumber": "9876543210"
}
```
- **Validation**: 10-digit numeric string starting with 6, 7, 8, or 9.
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "OTP sent successfully to +91 9876543210"
}
```

---

## 2. Verify OTP
- **Method**: `POST`
- **Route**: `/api/v1/auth/verify-otp`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```
- **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "user": {
      "id": "usr_7812903",
      "fullName": "Aditi Sharma",
      "phoneNumber": "9876543210",
      "role": "USER",
      "isPhoneVerified": true
    }
  }
}
```
*(Sets `Set-Cookie: token=jwt_string; HttpOnly; Path=/`)*

---

## 3. Register User
- **Method**: `POST`
- **Route**: `/api/v1/auth/register`
- **Auth**: None (Public)
- **Request Body**:
```json
{
  "fullName": "Aditi Sharma",
  "phoneNumber": "9876543210",
  "email": "aditi.sharma@example.com"
}
```
- **Success Response (201 Created)**:
```json
{
  "success": true,
  "message": "Account created. OTP dispatched for mobile verification.",
  "data": {
    "id": "usr_7812903",
    "phoneNumber": "9876543210"
  }
}
```
