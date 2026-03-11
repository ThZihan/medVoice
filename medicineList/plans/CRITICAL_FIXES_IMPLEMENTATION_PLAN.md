# Critical Fixes Implementation Plan
## Medicine List Generator - Production Readiness

**Date:** January 13, 2026
**Status:** NOT PUBLISHABLE - Critical Issues Must Be Fixed

---

## 🎯 Executive Summary

This document provides a step-by-step implementation plan to address all critical and high-priority issues preventing the Medicine List Generator from being production-ready.

**Current Status:** 8 Critical Issues + 7 High-Priority Issues
**Target Status:** Production-Ready with security best practices

---

## 📋 Phase 1: Critical Security Fixes (Must Do First)

### Fix 1.1: Move API Key to Backend Proxy

**Priority:** 🔴 CRITICAL (Security Risk)
**Estimated Effort:** Medium
**Files to Modify:**
- [`backend/medicines/views.py`](backend/medicines/views.py) - Add OCR proxy endpoint
- [`backend/.env.example`](backend/.env.example) - Add GEMINI_API_KEY
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) - Add environment variable loading
- [`medicineList_generator/ocr.js`](medicineList_generator/ocr.js) - Remove API key, call backend endpoint
- [`backend/medlist_backend/urls.py`](backend/medlist_backend/urls.py) - Add OCR route

**Implementation Steps:**

1. **Add python-dotenv to settings.py**
   ```python
   # At the top of backend/medlist_backend/settings.py
   from dotenv import load_dotenv
   import os

   load_dotenv()

   # Add after SECRET_KEY
   GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
   ```

2. **Create OCR proxy endpoint in backend/medicines/views.py**
   ```python
   @csrf_exempt
   @login_required
   def ocr_proxy_view(request):
       """Proxy OCR requests to Gemini API to keep API key secret"""
       if request.method != 'POST':
           return JsonResponse({'success': False, 'message': 'Only POST allowed'}, status=405)

       try:
           data = json.loads(request.body)
           image_data = data.get('image_data')
           mime_type = data.get('mime_type', 'image/jpeg')

           if not image_data:
               return JsonResponse({'success': False, 'message': 'No image data provided'}, status=400)

           # Call Gemini API from backend
           from django.conf import settings
           api_key = getattr(settings, 'GEMINI_API_KEY', None)

           if not api_key:
               return JsonResponse({'success': False, 'message': 'API key not configured'}, status=500)

           # Make request to Gemini API
           import requests
           response = requests.post(
               f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}',
               json={
                   'contents': [{
                       'parts': [
                           {'inline_data': {'mime_type': mime_type, 'data': image_data}},
                           {'text': get_ocr_prompt()}
                       ]
                   }],
                   'safetySettings': [
                       {'category': 'HARM_CATEGORY_HARASSMENT', 'threshold': 'BLOCK_NONE'},
                       {'category': 'HARM_CATEGORY_HATE_SPEECH', 'threshold': 'BLOCK_NONE'},
                       {'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT', 'threshold': 'BLOCK_NONE'},
                       {'category': 'HARM_CATEGORY_DANGEROUS_CONTENT', 'threshold': 'BLOCK_NONE'}
                   ]
               }
           )

           if response.status_code == 200:
               return JsonResponse({'success': True, 'data': response.json()}, status=200)
           else:
               return JsonResponse({'success': False, 'message': 'OCR failed'}, status=response.status_code)

       except Exception as e:
           return JsonResponse({'success': False, 'message': str(e)}, status=500)

   def get_ocr_prompt():
       return """You are a medical prescription OCR system. Extract the FIRST medicine found in this prescription image and return ONLY valid JSON in this exact format:
       {
           "medicineName": "string (exact medicine name from image)",
           "genericName": "string or null (generic name if visible)",
           "dose": "string (e.g., '500mg', '50mg', '10mg')",
           "frequency": "Daily" | "per NEED" | "Weekly" | "Only Friday" | "Except WED & THUR",
           "foodTiming": "BEFORE FOOD" | "AFTER FOOD",
           "usedFor": "string (indication/reason for medicine)",
           "remarks": "string (any special instructions)"
       }"""
   ```

3. **Add URL route in backend/medlist_backend/urls.py**
   ```python
   from medicines.views import ocr_proxy_view

   urlpatterns = [
       # ... existing routes ...
       path('api/ocr/', ocr_proxy_view, name='ocr_proxy'),
   ]
   ```

4. **Update frontend ocr.js to call backend endpoint**
   ```javascript
   // Remove this line from medicineList_generator/ocr.js:7
   // const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY_HERE';

   // Replace scanPrescription function
   async function scanPrescription() {
       const imageData = ocrModal.dataset.imageData;
       if (!imageData) {
           alert('Please select an image first');
           return;
       }

       showScanningOverlay();

       try {
           const base64Data = imageData.split(',')[1];
           const mimeType = imageData.substring(5, imageData.indexOf(';'));

           const response = await fetch(`${API_BASE_URL}/ocr/`, {
               method: 'POST',
               headers: {
                   'Content-Type': 'application/json',
               },
               credentials: 'include',
               body: JSON.stringify({
                   image_data: base64Data,
                   mime_type: mimeType
               })
           });

           const result = await response.json();

           hideScanningOverlay();

           if (result.success && result.data) {
               const medicineData = extractMedicineData(result.data);
               if (medicineData) {
                   autoFillForm(medicineData);
                   closeOCRModal();
               } else {
                   alert('Could not extract medicine data from image');
               }
           } else {
               alert('OCR failed: ' + result.message);
           }
       } catch (error) {
           hideScanningOverlay();
           console.error('OCR Error:', error);
           alert('Error processing image: ' + error.message);
       }
   }
   ```

5. **Update .env.example**
   ```env
   # Add to backend/.env.example
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

**Verification:**
- API key no longer visible in client-side code
- OCR functionality still works through backend proxy
- Backend logs show API calls being made

---

### Fix 1.2: Move SECRET_KEY to Environment Variable

**Priority:** 🔴 CRITICAL (Security Risk)
**Estimated Effort:** Low
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)
- [`backend/.env.example`](backend/.env.example)

**Implementation Steps:**

1. **Update settings.py**
   ```python
   # Replace line 23 in backend/medlist_backend/settings.py
   # SECRET_KEY = 'django-insecure-_i&)8sr67wel843k*$^*yq)1$q%bf-e#qg0g53m2jnwaa--wts'

   # With:
   SECRET_KEY = os.environ.get('SECRET_KEY')

   # Add fallback for development (remove in production)
   if not SECRET_KEY and DEBUG:
       import warnings
       warnings.warn('SECRET_KEY not set in environment. Using insecure default for development only.')
       SECRET_KEY = 'django-insecure-dev-only-change-in-production'
   ```

2. **Update .env.example**
   ```env
   # Ensure this is in backend/.env.example
   SECRET_KEY=your-secret-key-here-generate-with-python-manage-py-generate-secret-key
   ```

3. **Generate new secret key for production**
   ```bash
   cd backend
   python manage.py generate_secret_key
   ```

**Verification:**
- Run `python manage.py check` - should pass
- Application starts without hardcoded key
- SECRET_KEY not in source code

---

### Fix 1.3: Configure DEBUG and ALLOWED_HOSTS

**Priority:** 🔴 CRITICAL (Security Risk)
**Estimated Effort:** Low
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)
- [`backend/.env.example`](backend/.env.example)

**Implementation Steps:**

1. **Update settings.py**
   ```python
   # Replace line 26 in backend/medlist_backend/settings.py
   # DEBUG = True

   # With:
   DEBUG = os.environ.get('DEBUG', 'False') == 'True'

   # Replace line 28 in backend/medlist_backend/settings.py
   # ALLOWED_HOSTS = []

   # With:
   ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
   ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS if host.strip()]

   # Add localhost for development
   if DEBUG:
       ALLOWED_HOSTS.extend(['127.0.0.1', 'localhost'])
   ```

2. **Update .env.example**
   ```env
   # Ensure these are in backend/.env.example
   DEBUG=True
   ALLOWED_HOSTS=127.0.0.1,localhost
   ```

3. **Add production security settings**
   ```python
   # Add to backend/medlist_backend/settings.py (after ALLOWED_HOSTS)

   # Security settings for production
   if not DEBUG:
       SECURE_SSL_REDIRECT = True
       SESSION_COOKIE_SECURE = True
       CSRF_COOKIE_SECURE = True
       SESSION_COOKIE_HTTPONLY = True
       CSRF_COOKIE_HTTPONLY = True
       SECURE_BROWSER_XSS_FILTER = True
       SECURE_CONTENT_TYPE_NOSNIFF = True
       X_FRAME_OPTIONS = 'DENY'
       SECURE_HSTS_SECONDS = 31536000
       SECURE_HSTS_INCLUDE_SUBDOMAINS = True
       SECURE_HSTS_PRELOAD = True
   ```

**Verification:**
- Development: DEBUG=True, works on localhost
- Production: DEBUG=False, only works on configured hosts
- Security headers present in production

---

### Fix 1.4: Enable CSRF Protection

**Priority:** 🔴 CRITICAL (Security Risk)
**Estimated Effort:** Medium
**Files to Modify:**
- [`backend/medicines/views.py`](backend/medicines/views.py)
- [`medicineList_generator/auth.js`](medicineList_generator/auth.js)
- [`medicineList_generator/script.js`](medicineList_generator/script.js)
- [`medicineList_generator/index.html`](medicineList_generator/index.html)
- [`medicineList_generator/login.html`](medicineList_generator/login.html)

**Implementation Steps:**

1. **Remove @csrf_exempt from views.py**
   ```python
   # Remove @csrf_exempt decorator from these views in backend/medicines/views.py:
   # - login_view (line 13)
   # - register_view (line 52)
   # - logout_view (line 112)
   # - get_user_medicines (line 302)
   # - add_user_medicine (line 362)
   # - delete_user_medicine (line 460)
   # - get_patient_profile (line 129)
   # - update_patient_profile (line 170)

   # Keep only @login_required where needed
   ```

2. **Add CSRF token to HTML templates**

   In [`medicineList_generator/index.html`](medicineList_generator/index.html):
   ```html
   <!-- Add in <head> section -->
   <meta name="csrf-token" content="{{ csrf_token }}">
   ```

   In [`medicineList_generator/login.html`](medicineList_generator/login.html):
   ```html
   <!-- Add in <head> section -->
   <meta name="csrf-token" content="{{ csrf_token }}">
   ```

3. **Add CSRF token to JavaScript fetch calls**

   Create a helper function in [`medicineList_generator/auth.js`](medicineList_generator/auth.js):
   ```javascript
   // Add at the top of the file
   function getCSRFToken() {
       const metaTag = document.querySelector('meta[name="csrf-token"]');
       return metaTag ? metaTag.getAttribute('content') : '';
   }

   function getFetchOptions(method = 'GET', body = null) {
       const options = {
           method: method,
           credentials: 'include',
           headers: {
               'X-CSRFToken': getCSRFToken(),
           }
       };

       if (body) {
           options.headers['Content-Type'] = 'application/json';
           options.body = JSON.stringify(body);
       }

       return options;
   }
   ```

4. **Update fetch calls in auth.js**
   ```javascript
   // Update handleLogin function
   async function handleLogin(event) {
       event.preventDefault();

       const formData = new FormData(loginForm);
       const response = await fetch('/api/login/', {
           method: 'POST',
           body: formData,
           credentials: 'include',
           headers: {
               'X-CSRFToken': getCSRFToken()
           }
       });
       // ... rest of function
   }

   // Update handleRegister function
   async function handleRegister(event) {
       event.preventDefault();

       const formData = new FormData(registerForm);
       const response = await fetch('/api/register/', {
           method: 'POST',
           body: formData,
           credentials: 'include',
           headers: {
               'X-CSRFToken': getCSRFToken()
           }
       });
       // ... rest of function
   }

   // Update logout function
   async function logout() {
       const response = await fetch('/api/logout/', {
           method: 'POST',
           credentials: 'include',
           headers: {
               'X-CSRFToken': getCSRFToken()
           }
       });
       // ... rest of function
   }
   ```

5. **Update fetch calls in script.js**
   ```javascript
   // Add the same helper functions at the top of medicineList_generator/script.js
   function getCSRFToken() {
       const metaTag = document.querySelector('meta[name="csrf-token"]');
       return metaTag ? metaTag.getAttribute('content') : '';
   }

   // Update all API calls to include CSRF token
   // Example for addMedicine:
   const response = await fetch(`${API_BASE_URL}/medicines/add/`, {
       method: 'POST',
       headers: {
           'Content-Type': 'application/json',
           'X-CSRFToken': getCSRFToken()
       },
       credentials: 'include',
       body: JSON.stringify(medicineData)
   });

   // Example for deleteMedicine:
   const response = await fetch(`${API_BASE_URL}/medicines/${medicineId}/delete/`, {
       method: 'DELETE',
       headers: {
           'X-CSRFToken': getCSRFToken()
       },
       credentials: 'include'
   });
   ```

**Verification:**
- All POST/DELETE requests include CSRF token
- CSRF protection works in browser
- No 403 Forbidden errors on legitimate requests

---

### Fix 1.5: Migrate to PostgreSQL

**Priority:** 🔴 CRITICAL (Production Readiness)
**Estimated Effort:** Medium
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)
- [`backend/requirements.txt`](backend/requirements.txt) - Create this file
- [`backend/.env.example`](backend/.env.example)

**Implementation Steps:**

1. **Create requirements.txt**
   ```txt
   Django==5.0.1
   python-dotenv==1.0.0
   psycopg2-binary==2.9.9
   gunicorn==21.2.0
   whitenoise==6.6.0
   Pillow==10.1.0
   requests==2.31.0
   django-ratelimit==4.1.0
   ```

2. **Update settings.py for PostgreSQL**
   ```python
   # Replace DATABASES section in backend/medlist_backend/settings.py (lines 77-82)

   DATABASES = {
       'default': {
           'ENGINE': os.environ.get('DB_ENGINE', 'django.db.backends.sqlite3'),
           'NAME': os.environ.get('DB_NAME', BASE_DIR / 'db.sqlite3'),
           'USER': os.environ.get('DB_USER', ''),
           'PASSWORD': os.environ.get('DB_PASSWORD', ''),
           'HOST': os.environ.get('DB_HOST', ''),
           'PORT': os.environ.get('DB_PORT', ''),
       }
   }

   # Fallback to SQLite for development
   if DEBUG and not os.environ.get('DB_NAME'):
       DATABASES['default'] = {
           'ENGINE': 'django.db.backends.sqlite3',
           'NAME': BASE_DIR / 'db.sqlite3',
       }
   ```

3. **Update .env.example**
   ```env
   # Database Configuration (for production)
   DB_ENGINE=django.db.backends.postgresql
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   ```

4. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

5. **Create PostgreSQL database (for local testing)**
   ```bash
   # On Windows with PostgreSQL installed
   createdb medlist_db

   # Create user and grant permissions
   psql -d postgres
   CREATE USER medlist_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE medlist_db TO medlist_user;
   \q
   ```

6. **Run migrations**
   ```bash
   cd backend
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

**Verification:**
- Application connects to PostgreSQL
- All migrations run successfully
- CRUD operations work with PostgreSQL

---

### Fix 1.6: Fix Hardcoded API URL

**Priority:** 🔴 CRITICAL (Production Readiness)
**Estimated Effort:** Low
**Files to Modify:**
- [`medicineList_generator/config.js`](medicineList_generator/config.js)

**Implementation Steps:**

1. **Update config.js**
   ```javascript
   // Replace line 6 in medicineList_generator/config.js
   // const API_BASE_URL = 'http://127.0.0.1:8000/api';

   // With:
   const API_BASE_URL = window.location.origin + '/api';

   // Alternative: Use environment-specific configuration
   // Uncomment below if you need different URLs for different environments
   /*
   const API_BASE_URL = process.env.API_BASE_URL || window.location.origin + '/api';
   */
   ```

**Verification:**
- API calls work on localhost
- API calls work on production domain
- No hardcoded URLs in JavaScript

---

### Fix 1.7: Create requirements.txt

**Priority:** 🔴 CRITICAL (Deployment)
**Estimated Effort:** Low
**Files to Create:**
- [`backend/requirements.txt`](backend/requirements.txt)

**Implementation Steps:**

1. **Create requirements.txt**
   ```txt
   Django==5.0.1
   python-dotenv==1.0.0
   psycopg2-binary==2.9.9
   gunicorn==21.2.0
   whitenoise==6.6.0
   Pillow==10.1.0
   requests==2.31.0
   django-ratelimit==4.1.0
   ```

2. **Verify dependencies**
   ```bash
   cd backend
   pip freeze > requirements.txt
   # Then edit to remove unnecessary packages
   ```

**Verification:**
- `pip install -r requirements.txt` works
- All required packages listed
- No version conflicts

---

### Fix 1.8: Create .gitignore

**Priority:** 🔴 CRITICAL (Security)
**Estimated Effort:** Low
**Files to Create:**
- [`.gitignore`](.gitignore)

**Implementation Steps:**

1. **Create .gitignore in project root**
   ```gitignore
   # Python
   __pycache__/
   *.py[cod]
   *$py.class
   *.so
   .Python
   env/
   venv/
   ENV/
   build/
   develop-eggs/
   dist/
   downloads/
   eggs/
   .eggs/
   lib/
   lib64/
   parts/
   sdist/
   var/
   wheels/
   *.egg-info/
   .installed.cfg
   *.egg

   # Django
   *.log
   local_settings.py
   db.sqlite3
   db.sqlite3-journal
   staticfiles/
   media/

   # Environment variables
   .env
   .env.local
   .env.production

   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   *~

   # OS
   .DS_Store
   Thumbs.db

   # Screenshots
   screenshot*.png
   *.png
   !medicineList_generator/*.png  # Keep necessary images

   # Logs
   logs/
   *.log

   # Cache
   backend/cache/
   ```

**Verification:**
- `.gitignore` exists in project root
- Sensitive files excluded from git
- `git status` shows clean repository

---

### Fix 1.9: Create Procfile

**Priority:** 🔴 CRITICAL (Deployment)
**Estimated Effort:** Low
**Files to Create:**
- [`Procfile`](Procfile)

**Implementation Steps:**

1. **Create Procfile in project root**
   ```procfile
   web: cd backend && gunicorn medlist_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 3
   ```

2. **Create runtime.txt (optional, for Heroku)**
   ```txt
   python-3.11.7
   ```

**Verification:**
- Procfile exists in project root
- Valid Procfile format
- Gunicorn command is correct

---

## 📋 Phase 2: High Priority Fixes

### Fix 2.1: Add Rate Limiting

**Priority:** 🟡 HIGH (Security)
**Estimated Effort:** Medium
**Files to Modify:**
- [`backend/requirements.txt`](backend/requirements.txt)
- [`backend/medicines/views.py`](backend/medicines/views.py)

**Implementation Steps:**

1. **Add django-ratelimit to requirements.txt**
   ```txt
   django-ratelimit==4.1.0
   ```

2. **Install package**
   ```bash
   pip install django-ratelimit
   ```

3. **Add to INSTALLED_APPS in settings.py**
   ```python
   INSTALLED_APPS = [
       'django.contrib.admin',
       'django.contrib.auth',
       'django.contrib.contenttypes',
       'django.contrib.sessions',
       'django.contrib.messages',
       'django.contrib.staticfiles',
       'ratelimit',  # Add this
       'medicines',
   ]
   ```

4. **Add rate limiting to views.py**
   ```python
   from django_ratelimit.decorators import ratelimit

   # Add to login_view
   @ratelimit(key='ip', rate='5/m', block=True)
   @csrf_exempt
   def login_view(request):
       # ... existing code ...

   # Add to register_view
   @ratelimit(key='ip', rate='3/h', block=True)
   @csrf_exempt
   def register_view(request):
       # ... existing code ...

   # Add to add_user_medicine
   @ratelimit(key='user', rate='30/m', block=True)
   @csrf_exempt
   @login_required
   def add_user_medicine(request):
       # ... existing code ...
   ```

**Verification:**
- Rate limiting works on login
- Rate limiting works on registration
- Blocked requests receive 429 status

---

### Fix 2.2: Configure Session Timeout

**Priority:** 🟡 HIGH (Security)
**Estimated Effort:** Low
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)

**Implementation Steps:**

1. **Add session settings to settings.py**
   ```python
   # Add to backend/medlist_backend/settings.py

   # Session timeout settings
   SESSION_COOKIE_AGE = 60 * 60 * 24 * 7  # 7 days in seconds
   SESSION_SAVE_EVERY_REQUEST = True
   SESSION_EXPIRE_AT_BROWSER_CLOSE = False

   # For production, use shorter timeout
   if not DEBUG:
       SESSION_COOKIE_AGE = 60 * 60 * 2  # 2 hours in production
   ```

**Verification:**
- Sessions expire after configured time
- Users are logged out after timeout
- Session cookies have correct expiry

---

### Fix 2.3: Implement Password Reset

**Priority:** 🟡 HIGH (User Experience)
**Estimated Effort:** High
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)
- [`backend/medlist_backend/urls.py`](backend/medlist_backend/urls.py)
- [`medicineList_generator/login.html`](medicineList_generator/login.html)
- Create new templates

**Implementation Steps:**

1. **Configure email backend in settings.py**
   ```python
   # Add to backend/medlist_backend/settings.py

   # Email configuration
   EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
   EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
   EMAIL_USE_TLS = True
   EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
   EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
   DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@medlist.com')

   # Password reset settings
   PASSWORD_RESET_TIMEOUT = 60 * 60 * 24  # 24 hours
   ```

2. **Add password reset URLs**
   ```python
   # Add to backend/medlist_backend/urls.py

   from django.contrib.auth import views as auth_views

   urlpatterns = [
       # ... existing routes ...

       # Password reset URLs
       path('password_reset/', auth_views.PasswordResetView.as_view(
           template_name='password_reset.html',
           email_template_name='password_reset_email.html',
           success_url='/password_reset/done/'
       ), name='password_reset'),

       path('password_reset/done/', auth_views.PasswordResetDoneView.as_view(
           template_name='password_reset_done.html'
       ), name='password_reset_done'),

       path('reset/<uidb64>/<token>/', auth_views.PasswordResetConfirmView.as_view(
           template_name='password_reset_confirm.html',
           success_url='/reset/done/'
       ), name='password_reset_confirm'),

       path('reset/done/', auth_views.PasswordResetCompleteView.as_view(
           template_name='password_reset_complete.html'
       ), name='password_reset_complete'),
   ]
   ```

3. **Create password reset templates** in `medicineList_generator/`:
   - `password_reset.html`
   - `password_reset_done.html`
   - `password_reset_email.html`
   - `password_reset_confirm.html`
   - `password_reset_complete.html`

4. **Add "Forgot Password" link to login.html**

**Verification:**
- Password reset email is sent
- Reset link works
- Password can be changed successfully

---

### Fix 2.4: Add Email Verification

**Priority:** 🟡 HIGH (Security)
**Estimated Effort:** High
**Files to Modify:**
- [`backend/medicines/views.py`](backend/medicines/views.py)
- [`backend/medicines/models.py`](backend/medicines/models.py)
- [`medicineList_generator/auth.js`](medicineList_generator/auth.js)

**Implementation Steps:**

1. **Add email verification field to models.py**
   ```python
   class Patient(models.Model):
       user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
       age = models.IntegerField()
       email = models.EmailField(blank=True, null=True)
       email_verified = models.BooleanField(default=False)  # Add this
       verification_token = models.CharField(max_length=100, blank=True, null=True)  # Add this

       def __str__(self):
           return self.user.username
   ```

2. **Create migration**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

3. **Update register_view to send verification email**
   ```python
   # Modify backend/medicines/views.py register_view
   import secrets
   from django.core.mail import send_mail
   from django.conf import settings

   @csrf_exempt
   def register_view(request):
       # ... existing user creation code ...

       # Generate verification token
       token = secrets.token_urlsafe(32)
       patient.verification_token = token
       patient.email_verified = False
       patient.save()

       # Send verification email
       verification_url = f"{request.build_absolute_uri('/').rstrip('/')}/verify/{token}/"
       send_mail(
           'Verify your email',
           f'Click this link to verify your email: {verification_url}',
           settings.DEFAULT_FROM_EMAIL,
           [email],
           fail_silently=False,
       )

       return JsonResponse({
           'success': True,
           'message': 'Registration successful. Please check your email to verify your account.',
           'patient_id': patient.user.username,
           'name': patient.user.get_full_name() or patient.user.username
       }, status=201)
   ```

4. **Create verification view and URL**

**Verification:**
- Verification email is sent on registration
- Verification link works
- User cannot access protected features without verification

---

### Fix 2.5: Configure HTTPS and Secure Cookies

**Priority:** 🟡 HIGH (Security)
**Already covered in Fix 1.3**

---

### Fix 2.6: Create Error Pages

**Priority:** 🟡 HIGH (User Experience)
**Estimated Effort:** Low
**Files to Create:**
- [`medicineList_generator/404.html`](medicineList_generator/404.html)
- [`medicineList_generator/500.html`](medicineList_generator/500.html)

**Implementation Steps:**

1. **Create 404.html**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Page Not Found - Medicine List Generator</title>
       <link rel="stylesheet" href="/static/styles.css">
   </head>
   <body>
       <div class="error-page">
           <h1>404</h1>
           <h2>Page Not Found</h2>
           <p>The page you're looking for doesn't exist.</p>
           <a href="/" class="btn btn-primary">Go Home</a>
       </div>
   </body>
   </html>
   ```

2. **Create 500.html**
   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Server Error - Medicine List Generator</title>
       <link rel="stylesheet" href="/static/styles.css">
   </head>
   <body>
       <div class="error-page">
           <h1>500</h1>
           <h2>Server Error</h2>
           <p>Something went wrong on our end. Please try again later.</p>
           <a href="/" class="btn btn-primary">Go Home</a>
       </div>
   </body>
   </html>
   ```

3. **Add error page styling to styles.css**
   ```css
   .error-page {
       display: flex;
       flex-direction: column;
       align-items: center;
       justify-content: center;
       min-height: 100vh;
       text-align: center;
       padding: 20px;
   }

   .error-page h1 {
       font-size: 6rem;
       color: #e74c3c;
       margin: 0;
   }

   .error-page h2 {
       font-size: 2rem;
       margin: 10px 0;
   }

   .error-page p {
       color: #7f8c8d;
       margin-bottom: 20px;
   }
   ```

**Verification:**
- 404 page displays on invalid URLs
- 500 page displays on server errors
- Error pages are styled consistently

---

## 📋 Phase 3: Medium Priority Fixes

### Fix 3.1: Set Up Production Static File Serving

**Priority:** 🟢 MEDIUM (Performance)
**Estimated Effort:** Low
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)
- [`backend/requirements.txt`](backend/requirements.txt)

**Implementation Steps:**

1. **Add whitenoise to requirements.txt**
   ```txt
   whitenoise==6.6.0
   ```

2. **Install whitenoise**
   ```bash
   pip install whitenoise
   ```

3. **Update settings.py**
   ```python
   # Add to MIDDLEWARE in backend/medlist_backend/settings.py
   MIDDLEWARE = [
       'whitenoise.middleware.WhiteNoiseMiddleware',  # Add at the top
       'django.middleware.security.SecurityMiddleware',
       # ... rest of middleware ...
   ]

   # Add static files settings
   STATIC_ROOT = BASE_DIR / 'staticfiles'
   STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
   ```

4. **Collect static files**
   ```bash
   python manage.py collectstatic
   ```

**Verification:**
- Static files are served efficiently
- Gzip compression works
- Static files have long cache headers

---

### Fix 3.2: Add Logging Configuration

**Priority:** 🟢 MEDIUM (Debugging)
**Estimated Effort:** Low
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)

**Implementation Steps:**

1. **Add logging to settings.py**
   ```python
   # Add to backend/medlist_backend/settings.py

   LOGGING = {
       'version': 1,
       'disable_existing_loggers': False,
       'formatters': {
           'verbose': {
               'format': '{levelname} {asctime} {module} {message}',
               'style': '{',
           },
       },
       'handlers': {
           'file': {
               'level': 'WARNING',
               'class': 'logging.FileHandler',
               'filename': BASE_DIR / 'logs' / 'django.log',
               'formatter': 'verbose',
           },
           'console': {
               'level': 'INFO',
               'class': 'logging.StreamHandler',
               'formatter': 'verbose',
           },
       },
       'root': {
           'handlers': ['console'],
           'level': 'INFO',
       },
       'loggers': {
           'django': {
               'handlers': ['file', 'console'],
               'level': 'WARNING',
               'propagate': False,
           },
           'medicines': {
               'handlers': ['file', 'console'],
               'level': 'INFO',
               'propagate': False,
           },
       },
   }

   # Create logs directory if it doesn't exist
   import os
   os.makedirs(BASE_DIR / 'logs', exist_ok=True)
   ```

**Verification:**
- Logs are written to file
- Console logs appear in terminal
- Log format is readable

---

### Fix 3.3: Implement Health Check Endpoint

**Priority:** 🟢 MEDIUM (Monitoring)
**Estimated Effort:** Low
**Files to Modify:**
- [`backend/medicines/views.py`](backend/medicines/views.py)
- [`backend/medlist_backend/urls.py`](backend/medlist_backend/urls.py)

**Implementation Steps:**

1. **Add health check view**
   ```python
   # Add to backend/medicines/views.py
   from django.db import connection
   from django.core.cache import cache

   @require_http_methods(["GET"])
   def health_check(request):
       """Health check endpoint for monitoring"""
       checks = {
           'status': 'healthy',
           'checks': {}
       }

       # Check database connection
       try:
           with connection.cursor() as cursor:
               cursor.execute('SELECT 1')
           checks['checks']['database'] = 'ok'
       except Exception as e:
           checks['status'] = 'unhealthy'
           checks['checks']['database'] = f'error: {str(e)}'

       # Check cache (if configured)
       try:
           cache.set('health_check', 'ok', 10)
           cache.get('health_check')
           checks['checks']['cache'] = 'ok'
       except Exception as e:
           checks['checks']['cache'] = f'not configured: {str(e)}'

       status_code = 200 if checks['status'] == 'healthy' else 503
       return JsonResponse(checks, status=status_code)
   ```

2. **Add URL**
   ```python
   # Add to backend/medlist_backend/urls.py
   from medicines.views import health_check

   urlpatterns = [
       # ... existing routes ...
       path('health/', health_check, name='health_check'),
   ]
   ```

**Verification:**
- `/health/` endpoint returns 200 when healthy
- Returns 503 when database is down
- Response includes check details

---

### Fix 3.4: Secure Admin Panel URL

**Priority:** 🟢 MEDIUM (Security)
**Estimated Effort:** Low
**Files to Modify:**
- [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py)
- [`backend/medlist_backend/urls.py`](backend/medlist_backend/urls.py)

**Implementation Steps:**

1. **Add admin URL to settings.py**
   ```python
   # Add to backend/medlist_backend/settings.py
   ADMIN_URL = os.environ.get('ADMIN_URL', 'admin-secret-xyz/')
   ```

2. **Update URLs**
   ```python
   # Update in backend/medlist_backend/urls.py
   from django.conf import settings

   urlpatterns = [
       path(f'{settings.ADMIN_URL}', admin.site.urls),
       # ... rest of routes ...
   ]
   ```

3. **Update .env.example**
   ```env
   ADMIN_URL=your-secret-admin-url/
   ```

**Verification:**
- Admin panel accessible at custom URL
- Default `/admin/` returns 404
- Custom URL works correctly

---

### Fix 3.5: Configure Backup Strategy

**Priority:** 🟢 MEDIUM (Data Safety)
**Estimated Effort:** Medium
**Files to Create:**
- [`scripts/backup.sh`](scripts/backup.sh)

**Implementation Steps:**

1. **Create backup script**
   ```bash
   # Create scripts/backup.sh
   #!/bin/bash

   # Configuration
   BACKUP_DIR="/path/to/backups"
   DB_NAME="${DB_NAME:-medlist_db}"
   DB_USER="${DB_USER:-medlist_user}"
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)

   # Create backup directory
   mkdir -p "$BACKUP_DIR"

   # Database backup
   pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

   # Compress backup
   gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

   # Keep only last 30 days of backups
   find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +30 -delete

   echo "Backup completed: db_backup_$TIMESTAMP.sql.gz"
   ```

2. **Make script executable**
   ```bash
   chmod +x scripts/backup.sh
   ```

3. **Set up cron job (Linux)**
   ```bash
   # Edit crontab
   crontab -e

   # Add daily backup at 2 AM
   0 2 * * * /path/to/scripts/backup.sh
   ```

**Verification:**
- Backup script runs manually
- Backup files are created
- Old backups are deleted

---

## 📋 Phase 4: Deployment Preparation

### Step 4.1: Create Production Environment File

Create `.env.production` (never commit to git):
```env
SECRET_KEY=your-generated-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_ENGINE=django.db.backends.postgresql
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_HOST=your-production-db-host.com
DB_PORT=5432
GEMINI_API_KEY=your-gemini-api-key
ADMIN_URL=your-secret-admin-url/
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

### Step 4.2: Pre-Deployment Checklist

- [ ] All critical fixes implemented
- [ ] All high-priority fixes implemented
- [ ] All tests pass
- [ ] Static files collected
- [ ] Database migrations run
- [ ] Environment variables configured
- [ ] Admin URL secured
- [ ] HTTPS certificate obtained
- [ ] Backup strategy in place
- [ ] Monitoring configured

### Step 4.3: Deployment Options

**Option 1: Render.com (Recommended)**
- Free tier available
- PostgreSQL included
- Automatic HTTPS
- Easy GitHub integration

**Option 2: PythonAnywhere**
- Free tier available
- Built-in PostgreSQL
- Good documentation

**Option 3: Railway.app**
- Free tier available
- PostgreSQL included
- Good UI

---

## 📊 Summary

### Fixes by Priority

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 9 | Must Fix Before Deployment |
| 🟡 High | 6 | Should Fix Before Production |
| 🟢 Medium | 5 | Nice to Have |

### Estimated Total Effort

- Critical Fixes: ~4-6 hours
- High Priority Fixes: ~6-8 hours
- Medium Priority Fixes: ~4-6 hours
- **Total: ~14-20 hours**

---

## 🎯 Next Steps

1. **Immediate:** Start with Phase 1 Critical Fixes
2. **Then:** Implement Phase 2 High Priority Fixes
3. **Finally:** Add Phase 3 Medium Priority Fixes
4. **Deploy:** Once all critical and high-priority fixes are complete

---

**Document Version:** 1.0
**Last Updated:** January 13, 2026
