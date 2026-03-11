# Medicine List API Documentation

This document provides comprehensive API documentation for the medicine list module, designed for integration with the MedVoice platform.

---

## Overview

The medicine list API provides RESTful endpoints for managing patient medication schedules, OCR prescription scanning, PDF generation, and color customization.

**Base URL**: `/api/medicine-list/`

**Authentication**: Session-based authentication (Django sessions)

**Content-Type**: `application/json`

---

## Authentication

All endpoints require authentication except for:
- Login
- Register

### Session Management

Authentication is handled via Django sessions. Include session cookies in requests.

```python
import requests

# Login to get session
session = requests.Session()
response = session.post('http://localhost:8000/api/medicine-list/login/', json={
    'patient_id': 'username',
    'password': 'password'
})

# Session cookies are now included in subsequent requests
response = session.get('http://localhost:8000/api/medicine-list/medicines/')
```

---

## API Endpoints

### Authentication Endpoints

#### 1. Login

**Endpoint**: `POST /api/medicine-list/login/`

**Description**: Authenticate user and create session

**Request Body**:
```json
{
  "patient_id": "string (username)",
  "password": "string"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**CSRF**: Exempt (for API compatibility)

---

#### 2. Register

**Endpoint**: `POST /api/medicine-list/register/`

**Description**: Register new user and create patient profile

**Request Body**:
```json
{
  "name": "string (patient name)",
  "patient_id": "string (username)",
  "password": "string",
  "age": "integer",
  "email": "string (optional)"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Registration successful"
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Username already exists"
}
```

**CSRF**: Exempt (for API compatibility)

---

#### 3. Logout

**Endpoint**: `POST /api/medicine-list/logout/`

**Description**: End user session

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**CSRF**: Exempt (for API compatibility)

---

### Patient Profile Endpoints

#### 4. Get Patient Profile

**Endpoint**: `GET /api/medicine-list/patient/profile/`

**Description**: Get current user's patient profile

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "patient": {
    "user": {
      "username": "string",
      "email": "string"
    },
    "age": "integer",
    "email": "string",
    "created_at": "YYYY-MM-DDTHH:MM:SSZ",
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
  }
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Patient profile not found"
}
```

---

#### 5. Update Patient Profile

**Endpoint**: `PUT /api/medicine-list/patient/profile/update/`

**Description**: Update current user's patient profile

**Authentication**: Required

**Request Body**:
```json
{
  "age": "integer (optional)",
  "email": "string (optional)"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "patient": {
    "user": {
      "username": "string",
      "email": "string"
    },
    "age": "integer",
    "email": "string",
    "created_at": "YYYY-MM-DDTHH:MM:SSZ",
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Invalid age value"
}
```

---

### Medicine Management Endpoints

#### 6. Get User Medicines

**Endpoint**: `GET /api/medicine-list/medicines/`

**Description**: Get all medicines for current user

**Authentication**: Required

**Query Parameters**:
- `timing` (optional): Filter by timing (morning, noon, night)
- `frequency` (optional): Filter by frequency

**Response** (200 OK):
```json
{
  "success": true,
  "medicines": [
    {
      "id": "integer",
      "medicine_name": "string",
      "generic_name": "string or null",
      "dose": "string",
      "instructions": "string or null",
      "cycle": "string",
      "schedule": "string",
      "with_food": "string",
      "indication": "string or null",
      "timing": ["morning", "noon", "night"],
      "created_at": "YYYY-MM-DDTHH:MM:SSZ",
      "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
    }
  ],
  "count": "integer"
}
```

**Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

#### 7. Add Medicine

**Endpoint**: `POST /api/medicine-list/medicines/add/`

**Description**: Add a new medicine to user's list

**Authentication**: Required

**Request Body**:
```json
{
  "medicine_name": "string (required)",
  "generic_name": "string (optional)",
  "dose": "string (optional)",
  "instructions": "string (optional)",
  "cycle": "string (required)",
  "schedule": "string (required)",
  "with_food": "string (required)",
  "indication": "string (optional)",
  "timing": ["morning", "noon", "night"] (required)
}
```

**Valid Timing Values**:
- `morning`
- `noon`
- `night`
- Combinations: `["morning", "noon"]`, `["morning", "night"]`, `["noon", "night"]`, `["morning", "noon", "night"]`

**Valid Cycle Values**:
- `Daily`
- `per NEED`
- `Weekly`
- `Only Friday`
- `Except WED & THUR`

**Valid With Food Values**:
- `BEFORE FOOD`
- `AFTER FOOD`

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Medicine added successfully",
  "medicine": {
    "id": "integer",
    "medicine_name": "string",
    "generic_name": "string or null",
    "dose": "string",
    "instructions": "string or null",
    "cycle": "string",
    "schedule": "string",
    "with_food": "string",
    "indication": "string or null",
    "timing": ["morning", "noon", "night"],
    "created_at": "YYYY-MM-DDTHH:MM:SSZ",
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Invalid timing value"
}
```

---

#### 8. Update Medicine

**Endpoint**: `PUT /api/medicine-list/medicines/<int:medicine_id>/update/`

**Description**: Update an existing medicine

**Authentication**: Required

**URL Parameters**:
- `medicine_id`: ID of medicine to update

**Request Body**: Same as Add Medicine (all fields optional)

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Medicine updated successfully",
  "medicine": {
    "id": "integer",
    "medicine_name": "string",
    "generic_name": "string or null",
    "dose": "string",
    "instructions": "string or null",
    "cycle": "string",
    "schedule": "string",
    "with_food": "string",
    "indication": "string or null",
    "timing": ["morning", "noon", "night"],
    "created_at": "YYYY-MM-DDTHH:MM:SSZ",
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
  }
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Medicine not found"
}
```

**Response** (403 Forbidden):
```json
{
  "success": false,
  "error": "You do not have permission to update this medicine"
}
```

---

#### 9. Delete Medicine

**Endpoint**: `DELETE /api/medicine-list/medicines/<int:medicine_id>/delete/`

**Description**: Delete a medicine from user's list

**Authentication**: Required

**URL Parameters**:
- `medicine_id`: ID of medicine to delete

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Medicine deleted successfully"
}
```

**Response** (404 Not Found):
```json
{
  "success": false,
  "error": "Medicine not found"
}
```

**Response** (403 Forbidden):
```json
{
  "success": false,
  "error": "You do not have permission to delete this medicine"
}
```

---

### Color Preferences Endpoints

#### 10. Get Color Preferences

**Endpoint**: `GET /api/medicine-list/colors/`

**Description**: Get user's color preferences for medicine timing

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "preferences": {
    "palette_type": "default or vibrant",
    "morning_color": "#72CB92",
    "noon_color": "#D79E63",
    "night_color": "#7DA7D7",
    "morning_noon_color": "#84cc16",
    "morning_night_color": "#06b6d4",
    "noon_night_color": "#8b5cf6",
    "all_day_color": "#6366f1",
    "custom_morning_noon": "boolean",
    "custom_morning_night": "boolean",
    "custom_noon_night": "boolean",
    "custom_all_day": "boolean",
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
  }
}
```

---

#### 11. Save Color Preferences

**Endpoint**: `POST /api/medicine-list/colors/save/`

**Description**: Save user's color preferences

**Authentication**: Required

**Request Body**:
```json
{
  "palette_type": "default or vibrant",
  "morning_color": "#72CB92",
  "noon_color": "#D79E63",
  "night_color": "#7DA7D7",
  "morning_noon_color": "#84cc16 (optional)",
  "morning_night_color": "#06b6d4 (optional)",
  "noon_night_color": "#8b5cf6 (optional)",
  "all_day_color": "#6366f1 (optional)",
  "custom_morning_noon": "boolean",
  "custom_morning_night": "boolean",
  "custom_noon_night": "boolean",
  "custom_all_day": "boolean"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Color preferences saved successfully",
  "preferences": {
    "palette_type": "default or vibrant",
    "morning_color": "#72CB92",
    "noon_color": "#D79E63",
    "night_color": "#7DA7D7",
    "morning_noon_color": "#84cc16",
    "morning_night_color": "#06b6d4",
    "noon_night_color": "#8b5cf6",
    "all_day_color": "#6366f1",
    "custom_morning_noon": "boolean",
    "custom_morning_night": "boolean",
    "custom_noon_night": "boolean",
    "custom_all_day": "boolean",
    "updated_at": "YYYY-MM-DDTHH:MM:SSZ"
  }
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Invalid hex color format"
}
```

---

#### 12. Get Available Palettes

**Endpoint**: `GET /api/medicine-list/colors/palettes/`

**Description**: Get available color palettes

**Authentication**: Not Required

**Response** (200 OK):
```json
{
  "success": true,
  "palettes": {
    "default": {
      "morning": "#72CB92",
      "noon": "#D79E63",
      "night": "#7DA7D7"
    },
    "vibrant": {
      "morning": "#10B981",
      "noon": "#F59E0B",
      "night": "#3B82F6"
    }
  }
}
```

---

### OCR Endpoint

#### 13. Scan Prescription

**Endpoint**: `POST /api/medicine-list/ocr/scan/`

**Description**: Extract medicines from prescription image using Gemini OCR

**Authentication**: Required

**Request Body**:
```json
{
  "image_data": "string (base64 encoded image)",
  "mime_type": "string (image/jpeg, image/png, image/webp, image/gif)"
}
```

**Image Requirements**:
- Format: JPEG, PNG, WebP, GIF
- Size: Maximum 10MB (base64 encoded)
- Content: Medical prescription with clear text

**Response** (200 OK):
```json
{
  "success": true,
  "medicines": [
    {
      "medicineName": "string",
      "genericName": "string or null",
      "dose": "string",
      "frequency": "Daily or per NEED or Weekly or Only Friday or Except WED & THUR",
      "foodTiming": "BEFORE FOOD or AFTER FOOD",
      "usedFor": "string",
      "remarks": "string (schedule like '1+0+1')"
    }
  ],
  "count": "integer"
}
```

**Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Image size exceeds 10MB limit"
}
```

**Response** (500 Internal Server Error):
```json
{
  "success": false,
  "error": "Failed to process image"
}
```

**CSRF**: Exempt (for API compatibility)

---

### Static File Endpoints

#### 14. Serve Static File

**Endpoint**: `GET /api/medicine-list/static/<path:filename>`

**Description**: Serve static files (development only)

**Authentication**: Not Required

**Note**: This endpoint is for development only. Use proper static file serving in production.

---

### Page Endpoints

#### 15. Serve Index Page

**Endpoint**: `GET /api/medicine-list/`

**Description**: Serve the main application page

**Authentication**: Not Required (redirects to login if not authenticated)

**Response**: HTML page

---

#### 16. Serve Login Page

**Endpoint**: `GET /api/medicine-list/login-page/`

**Description**: Serve the login page

**Authentication**: Not Required

**Response**: HTML page

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Authentication required or invalid credentials |
| 403 | Forbidden - No permission to access resource |
| 404 | Not Found - Resource does not exist |
| 500 | Internal Server Error - Server error occurred |

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Anonymous users**: 100 requests per day
- **Authenticated users**: 200 requests per day

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 200
X-RateLimit-Remaining: 195
X-RateLimit-Reset: 1640995200
```

---

## CORS Configuration

For cross-origin requests, configure CORS in Django settings:

```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://medvoice.example.com",
    "https://app.medvoice.com"
]

CORS_ALLOW_CREDENTIALS = True
```

---

## Integration Examples

### Python Example

```python
import requests

# Initialize session
session = requests.Session()

# Login
session.post('http://localhost:8000/api/medicine-list/login/', json={
    'patient_id': 'username',
    'password': 'password'
})

# Get medicines
response = session.get('http://localhost:8000/api/medicine-list/medicines/')
medicines = response.json()['medicines']

# Add medicine
session.post('http://localhost:8000/api/medicine-list/medicines/add/', json={
    'medicine_name': 'Paracetamol',
    'dose': '500mg',
    'cycle': 'Daily',
    'schedule': '1+0+1',
    'with_food': 'AFTER FOOD',
    'timing': ['morning', 'night']
})
```

### JavaScript Example

```javascript
// Login
const loginResponse = await fetch('/api/medicine-list/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        patient_id: 'username',
        password: 'password'
    })
});

// Get medicines
const medicinesResponse = await fetch('/api/medicine-list/medicines/', {
    credentials: 'include'
});
const medicines = await medicinesResponse.json();

// Add medicine
await fetch('/api/medicine-list/medicines/add/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
        medicine_name: 'Paracetamol',
        dose: '500mg',
        cycle: 'Daily',
        schedule: '1+0+1',
        with_food: 'AFTER FOOD',
        timing: ['morning', 'night']
    })
});
```

---

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/medicine-list/login/ \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"patient_id": "username", "password": "password"}'

# Get medicines (using session cookies)
curl http://localhost:8000/api/medicine-list/medicines/ \
  -b cookies.txt
```

### Using Django Test Client

```python
from django.test import Client

client = Client()

# Login
client.post('/api/medicine-list/login/', {
    'patient_id': 'username',
    'password': 'password'
})

# Get medicines
response = client.get('/api/medicine-list/medicines/')
print(response.json())
```

---

## Security Considerations

1. **Always use HTTPS** in production
2. **Validate input data** on both client and server
3. **Implement CSRF protection** for form submissions
4. **Use session-based authentication** for stateful operations
5. **Rate limit API calls** to prevent abuse
6. **Log all authentication attempts** for security monitoring
7. **Never expose API keys** in client-side code

---

## Additional Resources

- [Django REST Framework Documentation](https://www.django-rest-framework.org/)
- [MedVoice Integration Guide](MEDVOICE_INTEGRATION.md)
- [PostgreSQL Migration Guide](../deployment/POSTGRESQL_MIGRATION_GUIDE.md)

---

*Last Updated: 2026-03-11*
