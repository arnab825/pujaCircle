# Address API & PIN Code Detection Specifications - PujaCircle

## 1. PIN Code Location Lookup
- **Method**: `GET`
- **Future Production URL**: `https://api.postalpincode.in/pincode/[PINCODE]`
- **Frontend Mock Function**: `addressApi.lookupPincode(pincode)`
- **Behavior**:
  - Accepts 6-digit Indian postal PIN code.
  - Returns array of matching post office locations with locality, city, district, state, and country.
  - If multiple post offices match (e.g. `700019` in Kolkata), the frontend displays a dropdown for user selection before auto-populating address fields.

- **Example Response Format**:
```json
{
  "pincode": "700019",
  "locations": [
    {
      "postOffice": "Ballygunge Post Office",
      "locality": "Ballygunge",
      "city": "Kolkata",
      "district": "Kolkata",
      "state": "West Bengal",
      "country": "India"
    },
    {
      "postOffice": "Gariahat Road Post Office",
      "locality": "Gariahat",
      "city": "Kolkata",
      "district": "Kolkata",
      "state": "West Bengal",
      "country": "India"
    }
  ]
}
```

---

## 2. Address Creation
- **Method**: `POST`
- **Route**: `/api/v1/addresses`
- **Request Body**:
```json
{
  "label": "HOME",
  "recipientName": "Aditi Sharma",
  "phoneNumber": "+919876543210",
  "houseBuilding": "Flat 402, Ganga Tower",
  "street": "Rashbehari Avenue",
  "locality": "Ballygunge",
  "landmark": "Near Lake Mall",
  "pincode": "700019",
  "city": "Kolkata",
  "district": "Kolkata",
  "state": "West Bengal",
  "country": "India",
  "isDefault": true
}
```
