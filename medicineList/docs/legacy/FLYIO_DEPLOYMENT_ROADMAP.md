# Fly.io Deployment Roadmap

## 🎯 Complete Plan for AI-Assisted Deployment

This document outlines exactly what needs to be changed and the deployment steps I will execute.

---

## 📋 Files to Create/Modify

### 1. Create New Files

| File | Purpose | Status |
|------|---------|--------|
| [`fly.toml`](fly.toml) | Fly.io app configuration | ⏳ To create |
| [`backend/Dockerfile`](backend/Dockerfile) | Docker build configuration | ⏳ To create |
| [`backend/requirements.txt`](backend/requirements.txt) | Python dependencies | ⏳ To create |

### 2. Modify Existing Files

| File | Changes Needed | Status |
|------|---------------|--------|
| [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) | Add environment variables, whitenoise, security settings | ⏳ To modify |
| [`medicineList_generator/config.js`](medicineList_generator/config.js) | Fix API URL to use relative path | ⏳ To modify |

---

## 🔧 Detailed Code Changes

### File 1: [`fly.toml`](fly.toml) (NEW)

**Location:** Project root (same level as `backend/` and `medicineList_generator/`)

**Content:**
```toml
app = "medicine-list-generator"
primary_region = "sin"

[build]
  dockerfile = "backend/Dockerfile"

[env]
  DJANGO_SETTINGS_MODULE = "medlist_backend.settings"
  DEBUG = "False"
  ALLOWED_HOSTS = "medicine-list-generator.fly.dev"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  path = "/"
  protocol = "http"
  restart_limit = 5
  timeout = "5s"
  tls_skip_verify = false

[[statics]]
  guest_path = "/app/backend/staticfiles"
  url_prefix = "/static/"
```

---

### File 2: [`backend/Dockerfile`](backend/Dockerfile) (NEW)

**Location:** Inside `backend/` folder

**Content:**
```dockerfile
# Use Python 3.11 slim image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "medlist_backend.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "2"]
```

---

### File 3: [`backend/requirements.txt`](backend/requirements.txt) (NEW)

**Location:** Inside `backend/` folder

**Content:**
```txt
Django==5.0.1
python-dotenv==1.0.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
whitenoise==6.6.0
Pillow==10.1.0
dj-database-url==2.1.0
```

---

### File 4: [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) (MODIFY)

**Changes needed:**

1. **Add imports at top:**
```python
import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

load_dotenv()
```

2. **Update SECRET_KEY:**
```python
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-change-in-production')
```

3. **Update DEBUG:**
```python
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
```

4. **Update ALLOWED_HOSTS:**
```python
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')
```

5. **Add whitenoise to INSTALLED_APPS:**
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'whitenoise.runserver_nostatic',  # ADD THIS
    'medicines',
]
```

6. **Add whitenoise to MIDDLEWARE:**
```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ADD THIS (after SecurityMiddleware)
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

7. **Update DATABASES:**
```python
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}
```

8. **Add STATIC_ROOT (if not exists):**
```python
STATIC_ROOT = BASE_DIR / 'staticfiles'
```

9. **Add security settings at end (before DEFAULT_AUTO_FIELD):**
```python
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

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',')
```

---

### File 5: [`medicineList_generator/config.js`](medicineList_generator/config.js) (MODIFY)

**Current content:**
```javascript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

**Change to:**
```javascript
const API_BASE_URL = window.location.origin + '/api';
```

---

## 🚀 Deployment Steps (I Will Execute)

### Step 1: Install Fly CLI
```bash
# Windows PowerShell (as Administrator)
iwr https://fly.io/install.ps1 -useb | iex
```

### Step 2: Login to Fly
```bash
flyctl auth login
```
*(You will do this in browser - I'll wait for confirmation)*

### Step 3: Initialize Fly App
```bash
flyctl launch --no-deploy
```
*(This creates the app without deploying)*

### Step 4: Create PostgreSQL Database
```bash
flyctl postgres create
```
*(I'll use default settings: 1GB, 256MB RAM)*

### Step 5: Attach Database to App
```bash
flyctl postgres attach medlist-db --app medicine-list-generator
```

### Step 6: Set Environment Variables
```bash
flyctl secrets set SECRET_KEY="generated-secret-key"
flyctl secrets set ALLOWED_HOSTS="medicine-list-generator.fly.dev,www.medicine-list-generator.fly.dev"
flyctl secrets set CSRF_TRUSTED_ORIGINS="https://medicine-list-generator.fly.dev,https://www.medicine-list-generator.fly.dev"
```

### Step 7: Deploy Application
```bash
flyctl deploy
```
*(This will build and deploy your app)*

### Step 8: Run Migrations
```bash
flyctl ssh console
python manage.py migrate
exit
```

### Step 9: Create Superuser
```bash
flyctl ssh console
python manage.py createsuperuser
exit
```
*(I'll run the command, but you'll need to provide username/password)*

---

## 📝 What You Need to Do

### Before I Start (Do These Now)

1. **Create Fly.io Account**
   - Go to [fly.io](https://fly.io)
   - Sign up with GitHub
   - Verify email

2. **Install Fly CLI** (Optional - I can do this)
   - Open PowerShell as Administrator
   - Run: `iwr https://fly.io/install.ps1 -useb | iex`

3. **Login to Fly** (You must do this)
   - Run: `flyctl auth login`
   - Authorize in browser

4. **Provide Superuser Details** (I'll ask when needed)
   - Admin username
   - Admin password
   - Admin email

---

## ⏱️ Estimated Timeline

| Phase | Time | Who Does It |
|--------|------|-------------|
| **Account creation** | 2 min | You |
| **Fly CLI install** | 1 min | Me (or you) |
| **Fly login** | 2 min | You |
| **Code changes** | 5 min | Me |
| **App initialization** | 1 min | Me |
| **Database creation** | 2 min | Me |
| **Deployment** | 3-5 min | Me |
| **Migrations** | 1 min | Me |
| **Superuser creation** | 1 min | You (provide details) |
| **Total** | ~18 min | Split |

---

## ✅ Pre-Deployment Checklist

### Before I Start, Verify:

- [ ] You have a Fly.io account
- [ ] You have logged in with `flyctl auth login`
- [ ] You have superuser details ready (username/password/email)
- [ ] Your code is committed to git (optional but recommended)

---

## 🎯 Summary

**I will create/modify:**
- ✅ [`fly.toml`](fly.toml) - App configuration
- ✅ [`backend/Dockerfile`](backend/Dockerfile) - Docker config
- ✅ [`backend/requirements.txt`](backend/requirements.txt) - Dependencies
- ✅ [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) - Django settings
- ✅ [`medicineList_generator/config.js`](medicineList_generator/config.js) - API URL fix

**I will execute:**
- ✅ Fly CLI commands
- ✅ Database creation
- ✅ App deployment
- ✅ Migrations

**You need to do:**
- ✅ Create Fly.io account (2 min)
- ✅ Login to Fly CLI (2 min)
- ✅ Provide superuser details (1 min)

**Total your time:** ~5 minutes
**Total my time:** ~13 minutes

---

## 🚀 Ready to Deploy?

Once you have:
1. Created your Fly.io account
2. Logged in with `flyctl auth login`

Just tell me: **"Ready to deploy!"** and I'll handle everything else!

---

## 📚 Additional Notes

### About Regions
- `sin` - Singapore (recommended for Asia)
- `iad` - Virginia, USA
- `lhr` - London, UK
- `fra` - Frankfurt, Germany

I'll use Singapore by default since you're in Bangladesh. Let me know if you prefer a different region.

### About App Name
I'll use `medicine-list-generator` by default. If you want a different name, let me know.

### About Database
I'll create a database named `medlist-db` with 1GB storage and 256MB RAM (free tier).

---

## 📞 Communication During Deployment

I'll let you know:
- ✅ When I start each step
- ✅ When each step completes
- ✅ If I need any input from you
- ✅ When deployment is complete

You'll be able to see:
- ✅ Progress updates
- ✅ Any errors or warnings
- ✅ Final app URL

---

**Ready when you are! Just create your account and login, then say "Ready to deploy!"** 🚀
