# MedVoice Integration Guide

This guide provides step-by-step instructions for integrating the medicine list module into the MedVoice platform.

---

## Overview

The medicine list module is designed as a self-contained Django app that can be easily integrated into the larger MedVoice platform. It provides:

- Patient medication management
- OCR prescription scanning
- PDF generation for medicine schedules
- Color customization for timing indicators
- RESTful API endpoints

### Integration Architecture

```
MedVoice Platform
├── Core Services (Users, Auth, etc.)
├── Medicine List Module (this integration)
│   ├── Django App: medicines
│   ├── AI Services: ai_services
│   └── Utils: utils
└── Other Modules...
```

---

## Prerequisites

### 1. MedVoice Platform Requirements

- Django 5.0.1 or higher
- PostgreSQL 12+ with pgvector extension
- Python 3.10+
- Redis (for Celery)

### 2. Required Dependencies

Install the medicine list dependencies:

```bash
pip install -r requirements.txt
```

Key dependencies:
- `Django==5.0.1`
- `djangorestframework==3.14.0`
- `psycopg2-binary==2.9.9`
- `reportlab==4.0.7`
- `celery==5.3.4`
- `redis==5.0.1`
- `pgvector==0.2.4`

---

## Step 1: Copy Medicine List Module

### 1.1 Copy Module Directory

Copy the entire `medicines` directory to your MedVoice project:

```bash
# From medicine list project
cp -r backend/medicines /path/to/medvoice/backend/

# Copy AI services
cp -r backend/ai_services /path/to/medvoice/backend/

# Copy utils
cp -r backend/utils /path/to/medvoice/backend/
```

### 1.2 Verify Directory Structure

```
medvoice/
├── backend/
│   ├── medicines/           # Medicine list app
│   ├── ai_services/        # AI services (Gemini, GLM)
│   └── utils/              # Utility functions
```

---

## Step 2: Update Django Settings

### 2.1 Add to INSTALLED_APPS

Add the medicine list app to your `settings.py`:

```python
# medvoice/settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    
    # Medicine List Module
    'medicines',
    
    # Other MedVoice apps...
]
```

### 2.2 Configure Database

Add PostgreSQL configuration for medicine list:

```python
# medvoice/settings.py

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('POSTGRES_DB'),
        'USER': config('POSTGRES_USER'),
        'PASSWORD': config('POSTGRES_PASSWORD'),
        'HOST': config('POSTGRES_HOST'),
        'PORT': config('POSTGRES_PORT', default='5432'),
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}
```

### 2.3 Add API Keys

Add AI service API keys to settings:

```python
# medvoice/settings.py

# Gemini API for OCR
GEMINI_API_KEY = config('GEMINI_API_KEY', default='')

# GLM API for content generation
GLM_API_KEY = config('GLM_API_KEY', default='')
```

### 2.4 Configure Static Files

Add medicine list static files to settings:

```python
# medvoice/settings.py

STATICFILES_DIRS = [
    BASE_DIR / 'static',
    # Add medicine list static files if needed
    BASE_DIR / '../medicine-list-frontend/static',
]

STATIC_ROOT = BASE_DIR / 'staticfiles'
```

---

## Step 3: Update URL Configuration

### 3.1 Include Medicine List URLs

Add medicine list URLs to your main `urls.py`:

```python
# medvoice/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Medicine List Module with namespace
    path('api/medicine-list/', include('medicines.urls')),
    
    # Other MedVoice URLs...
]
```

### 2.2 Verify URL Namespace

The medicine list URLs use the namespace `/api/medicine-list/`:

```
/api/medicine-list/login/
/api/medicine-list/register/
/api/medicine-list/medicines/
/api/medicine-list/ocr/scan/
...
```

---

## Step 4: Database Migration

### 4.1 Run Migrations

Apply medicine list migrations to MedVoice database:

```bash
# Navigate to MedVoice backend
cd /path/to/medvoice/backend

# Create migrations (if needed)
python manage.py makemigrations medicines

# Apply migrations
python manage.py migrate medicines

# Verify migrations
python manage.py showmigrations medicines
```

### 4.2 Enable pgvector Extension

Enable the pgvector extension for vector similarity search:

```bash
# Connect to PostgreSQL
psql -U medvoice_user -d medvoice_db

# Enable extension
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

---

## Step 5: Authentication Integration

### 5.1 Review Current Auth Flow

The medicine list module uses Django's built-in session authentication.

**Current Flow**:
1. User submits login credentials to `/api/medicine-list/login/`
2. Server validates credentials
3. Server creates Django session
4. Session cookie returned to client
5. Subsequent requests include session cookie

### 5.2 Integrate with MedVoice Auth

If MedVoice uses a different authentication system (e.g., JWT, OAuth), you have two options:

#### Option A: Use MedVoice Auth (Recommended)

Update medicine list views to use MedVoice authentication:

```python
# medicines/views.py

from django.contrib.auth.decorators import login_required
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

# Use MedVoice permission class
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Use MedVoice's IsAuthenticated
def get_user_medicines(request):
    # Medicine list logic...
    pass
```

#### Option B: Keep Separate Auth

Keep medicine list authentication separate and link users:

```python
# medicines/models.py

class Patient(BaseModel):
    user = models.OneToOneField(
        'medvoice.User',  # Reference MedVoice's User model
        on_delete=models.CASCADE,
        primary_key=True
    )
```

### 5.3 Create User Profile Sync

Automatically create patient profile when MedVoice user is created:

```python
# medicines/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from medvoice.models import User  # Import MedVoice User model
from .models import Patient

@receiver(post_save, sender=User)
def create_patient_profile(sender, instance, created, **kwargs):
    """Create patient profile when MedVoice user is created"""
    if created:
        Patient.objects.get_or_create(user=instance)

# medicines/apps.py
default_app_config.ready = lambda: import_module('medicines.signals')
```

---

## Step 6: Frontend Integration

### 6.1 Copy Frontend Assets

Copy medicine list frontend assets:

```bash
# Copy static files
cp -r frontend/static/css /path/to/medvoice/frontend/static/
cp -r frontend/static/js /path/to/medvoice/frontend/static/

# Copy templates
cp -r frontend/templates/medicine-list/ /path/to/medvoice/frontend/templates/
```

### 6.2 Update API Base URL

Update JavaScript configuration to use MedVoice base URL:

```javascript
// frontend/static/js/config.js

const API_BASE_URL = '/api/medicine-list/';
```

### 6.3 Integrate with MedVoice UI

Add medicine list section to MedVoice dashboard:

```html
<!-- medvoice/templates/dashboard.html -->

<div class="dashboard-container">
    <!-- Other MedVoice sections... -->
    
    <!-- Medicine List Section -->
    <section id="medicine-list-section">
        <h2>Medicine Schedule</h2>
        <button id="open-medicine-list">Manage Medicines</button>
    </section>
</div>

<script>
document.getElementById('open-medicine-list').addEventListener('click', function() {
    // Navigate to medicine list or open modal
    window.location.href = '/api/medicine-list/';
});
</script>
```

---

## Step 7: Shared Services Integration

### 7.1 Use AI Services

Import and use AI services in MedVoice:

```python
# medvoice/views.py

from ai_services.gemini_service import GeminiAPIService
from ai_services.glm_service import GLMAPIService

# Use Gemini OCR
gemini = GeminiAPIService()
result = gemini.extract_medicines_from_image(image_data, mime_type)

# Use GLM content generation
glm = GLMAPIService()
review = glm.generate_review_from_qa(answers)
```

### 7.2 Use Utils

Import utility functions:

```python
# medvoice/views.py

from utils.pdf_generator import generate_medicine_pdf
from utils.color_calculator import calculate_combined_colors

# Generate PDF
pdf_data = generate_medicine_pdf(medicines, patient_name, patient_age)

# Calculate colors
colors = calculate_combined_colors(morning, noon, night)
```

---

## Step 8: API Integration

### 8.1 Call Medicine List API from MedVoice

Example of calling medicine list endpoints from MedVoice:

```python
# medvoice/views.py

import requests
from django.conf import settings

def get_patient_medicines(request, patient_id):
    """Get patient's medicines from medicine list module"""
    try:
        # Call medicine list API
        response = requests.get(
            f'{settings.MEDICINE_LIST_API_URL}/medicines/',
            headers={'Authorization': f'Bearer {request.auth.token}'}
        )
        
        if response.status_code == 200:
            medicines = response.json()['medicines']
            return JsonResponse({'success': True, 'medicines': medicines})
        else:
            return JsonResponse({'success': False, 'error': 'Failed to fetch medicines'}, 
                          status=response.status_code)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, 
                          status=500)
```

### 8.2 Webhook Integration

Set up webhooks for medicine list events:

```python
# medicines/views.py

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def medicine_list_webhook(request):
    """Handle medicine list events"""
    event = request.json()
    
    if event['type'] == 'medicine_added':
        # Notify MedVoice
        notify_medvoice(event['data'])
    
    return JsonResponse({'success': True})
```

---

## Step 9: Testing the Integration

### 9.1 Test Medicine List Endpoints

```bash
# Test login
curl -X POST http://localhost:8000/api/medicine-list/login/ \
  -H "Content-Type: application/json" \
  -d '{"patient_id": "testuser", "password": "testpass"}'

# Test get medicines
curl http://localhost:8000/api/medicine-list/medicines/ \
  --cookie "sessionid=..."

# Test OCR
curl -X POST http://localhost:8000/api/medicine-list/ocr/scan/ \
  -H "Content-Type: application/json" \
  -d '{"image_data": "base64_image", "mime_type": "image/jpeg"}'
```

### 9.2 Test Database Integration

```python
# test_integration.py
from django.test import TestCase
from medicines.models import Patient, UserMedicine

class IntegrationTest(TestCase):
    def test_patient_creation(self):
        user = User.objects.create_user('test', 'test@example.com', 'pass')
        patient = Patient.objects.create(user=user, age=30)
        self.assertEqual(patient.user.username, 'test')
    
    def test_medicine_query(self):
        user = User.objects.create_user('test', 'test@example.com', 'pass')
        patient = Patient.objects.create(user=user, age=30)
        medicine = UserMedicine.objects.create(
            patient=patient,
            medicine_name='Paracetamol',
            dose='500mg',
            cycle='Daily',
            schedule='1+0+1',
            with_food='AFTER FOOD'
        )
        self.assertEqual(medicine.medicine_name, 'Paracetamol')
```

### 9.3 Test AI Services

```python
# test_ai_services.py
from ai_services.gemini_service import GeminiAPIService
from ai_services.glm_service import GLMAPIService

class AIServicesTest(TestCase):
    def test_gemini_ocr(self):
        gemini = GeminiAPIService()
        # Test with sample image data
        result = gemini.extract_medicines_from_image(
            'base64_encoded_image',
            'image/jpeg'
        )
        self.assertTrue(result['success'])
    
    def test_glm_review_generation(self):
        glm = GLMAPIService()
        answers = [
            {'question': 'What brings you here?', 'answer': 'Headache'}
        ]
        result = glm.generate_review_from_qa(answers)
        self.assertTrue(result['success'])
```

---

## Step 10: Deployment

### 10.1 Update Environment Variables

Add medicine list environment variables to MedVoice `.env`:

```bash
# Medicine List Configuration
GEMINI_API_KEY=your-gemini-key
GLM_API_KEY=your-glm-key

# Database (PostgreSQL for MedVoice)
POSTGRES_DB=medvoice_db
POSTGRES_USER=medvoice_user
POSTGRES_PASSWORD=secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### 10.2 Collect Static Files

```bash
# Collect all static files including medicine list
python manage.py collectstatic --noinput
```

### 10.3 Run Migrations

```bash
# Apply all migrations including medicine list
python manage.py migrate
```

### 10.4 Restart Services

```bash
# Restart Django application
systemctl restart medvoice

# Restart Celery worker (if using)
systemctl restart celery
```

---

## Troubleshooting

### Issue: Medicine list URLs not found

**Cause**: URL configuration not updated

**Solution**:
```python
# Verify URL include in medvoice/urls.py
urlpatterns = [
    path('api/medicine-list/', include('medicines.urls')),
]
```

### Issue: Database migration fails

**Cause**: Conflicts with existing MedVoice models

**Solution**:
```bash
# Check for conflicts
python manage.py makemigrations medicines --dry-run

# Resolve conflicts manually if needed
python manage.py migrate medicines --fake-initial
```

### Issue: Authentication not working

**Cause**: Different auth systems

**Solution**:
- Update medicine list to use MedVoice auth (Option A)
- Create user profile sync (Option B)
- Verify session cookie names match

### Issue: AI services not working

**Cause**: API keys not configured

**Solution**:
```bash
# Verify environment variables
echo $GEMINI_API_KEY
echo $GLM_API_KEY

# Check settings configuration
python manage.py shell -c "from django.conf import settings; print(settings.GEMINI_API_KEY)"
```

---

## Best Practices

### 1. Namespace Isolation

- Keep medicine list URLs under `/api/medicine-list/`
- Use distinct database table names
- Avoid model name conflicts

### 2. Configuration Management

- Use environment variables for all configuration
- Never hardcode API keys
- Document all required settings

### 3. Error Handling

- Implement proper error handling in integration points
- Log all integration errors
- Provide meaningful error messages

### 4. Performance

- Use database indexes for frequent queries
- Implement caching for expensive operations
- Optimize API response times

### 5. Security

- Validate all input data
- Implement rate limiting
- Use HTTPS in production
- Never expose API keys

---

## Rollback Procedure

If integration causes issues:

### 1. Remove Medicine List Module

```bash
# Remove from INSTALLED_APPS
# Comment out 'medicines' in settings.py

# Remove URL include
# Comment out path('api/medicine-list/', include('medicines.urls'))

# Rollback migrations
python manage.py migrate medicines zero
```

### 2. Restore Previous State

```bash
# Restore database backup
pg_restore -U medvoice_user -d medvoice_db backup.sql

# Restart services
systemctl restart medvoice
```

---

## Additional Resources

- [MedVoice Architecture Documentation](../architecture/MEDVOICE_ARCHITECTURE.md)
- [API Documentation](API_DOCUMENTATION.md)
- [Model Documentation](MODEL_DOCUMENTATION.md)
- [PostgreSQL Migration Guide](../deployment/POSTGRESQL_MIGRATION_GUIDE.md)
- [Django Integration Best Practices](https://docs.djangoproject.com/en/5.0/topics/applications/)

---

## Summary

This integration guide provides:

✅ Step-by-step integration instructions
✅ Settings configuration
✅ URL configuration
✅ Database migration
✅ Authentication integration
✅ Frontend integration
✅ Shared services usage
✅ API integration
✅ Testing procedures
✅ Deployment instructions
✅ Troubleshooting guide
✅ Best practices

For additional support, refer to the documentation links above.

---

*Last Updated: 2026-03-11*
