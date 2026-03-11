# Fly.io Deployment Guide (Free, No Credit Card, with HTTPS)

This guide will walk you through deploying your Medicine List Generator to Fly.io's free tier.

---

## 🎯 Why Fly.io?

| Feature | Status |
|---------|--------|
| **Free Tier** | ✅ Permanently free |
| **Credit Card** | ❌ NOT required |
| **Database** | ✅ PostgreSQL included |
| **Custom Domain** | ✅ Supported |
| **HTTPS** | ✅ Automatic |
| **Setup Difficulty** | ⭐⭐⭐ Medium (requires CLI) |
| **Your Code Changes** | Minimal |

---

## 📋 Prerequisites

- [ ] Fly.io account (free)
- [ ] Fly CLI installed
- [ ] Your code on GitHub
- [ ] 45-60 minutes of time

---

## 🚀 Step-by-Step Deployment

### Step 1: Install Fly CLI

#### Windows
Open PowerShell as Administrator and run:
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

#### macOS
```bash
curl -L https://fly.io/install.sh | sh
```

#### Linux
```bash
curl -L https://fly.io/install.sh | sh
```

After installation, restart your terminal and verify:
```bash
flyctl version
```

---

### Step 2: Create Fly.io Account

1. Go to [fly.io](https://fly.io)
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended)
4. Authorize Fly.io to access your GitHub account

**No credit card required for free tier!**

---

### Step 3: Login to Fly CLI

Open your terminal and run:
```bash
flyctl auth signup
```

Or if you already have an account:
```bash
flyctl auth login
```

This will open a browser window for authentication.

---

### Step 4: Prepare Your Django Settings

Open [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) and update:

```python
import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url

# Load environment variables
load_dotenv()

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key from environment
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key')

# Debug mode from environment
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# Allowed hosts from environment
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'whitenoise.runserver_nostatic',  # Add this
    'medicines',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'medlist_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / '../medicineList_generator'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'medlist_backend.wsgi.application'

# Database - Use PostgreSQL from Fly.io
DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / '../medicineList_generator',
]

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

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

### Step 5: Create requirements.txt

Create [`backend/requirements.txt`](backend/requirements.txt):

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

### Step 6: Create Dockerfile

Create [`backend/Dockerfile`](backend/Dockerfile):

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

### Step 7: Create fly.toml

Create [`fly.toml`](fly.toml) in your project root:

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

**Note:** Change `primary_region` to a region close to you:
- `sin` - Singapore
- `iad` - Virginia, USA
- `lhr` - London, UK
- `fra` - Frankfurt, Germany
- `syd` - Sydney, Australia

---

### Step 8: Initialize Fly App

Open terminal in your project root and run:

```bash
flyctl launch
```

Follow the prompts:
1. **App name**: `medicine-list-generator` (or choose your own)
2. **Region**: Choose the same as in `fly.toml`
3. **Deploy now**: No (we need to set up database first)

---

### Step 9: Create PostgreSQL Database

```bash
flyctl postgres create
```

Follow the prompts:
1. **Name**: `medlist-db` (or choose your own)
2. **Region**: Same as your app
3. **VM Size**: Development - Single node, 1x shared CPU, 256MB RAM
4. **Volume size**: 1GB
5. **Create?**: Yes

**IMPORTANT:** Save the connection URL that's displayed! It will look like:
```
postgres://medlist-db:password@medlist-db.internal:5432/medlist_db
```

---

### Step 10: Attach Database to App

```bash
flyctl postgres attach medlist-db --app medicine-list-generator
```

This will automatically set the `DATABASE_URL` environment variable.

---

### Step 11: Set Environment Variables

```bash
flyctl secrets set SECRET_KEY="your-secret-key-here"
flyctl secrets set ALLOWED_HOSTS="medicine-list-generator.fly.dev,www.medicine-list-generator.fly.dev"
flyctl secrets set CSRF_TRUSTED_ORIGINS="https://medicine-list-generator.fly.dev,https://www.medicine-list-generator.fly.dev"
```

**Generate a secure SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

### Step 12: Deploy Your App

```bash
flyctl deploy
```

This will:
1. Build the Docker image
2. Push to Fly.io registry
3. Deploy to your app

Wait for deployment to complete (2-5 minutes).

---

### Step 13: Run Database Migrations

After deployment, run migrations:

```bash
flyctl ssh console
```

You'll be in the app's shell. Run:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
exit
```

Follow the prompts to create an admin user.

---

### Step 14: Access Your Application

Your app is now live at:
```
https://medicine-list-generator.fly.dev
```

Open this URL in your browser!

---

## ✅ Testing Your Deployment

Test all features:

1. **Login Page**
   - Go to `https://medicine-list-generator.fly.dev`
   - You should see the login page

2. **Register New User**
   - Click "Create account"
   - Fill in the form
   - Submit

3. **Login**
   - Login with your new account

4. **Add Medicine**
   - Fill in the medicine form
   - Click "Add Medicine"

5. **Generate PDF**
   - Add some medicines
   - Click "Generate PDF"

6. **Admin Panel**
   - Go to `https://medicine-list-generator.fly.dev/admin`
   - Login with your superuser credentials

---

## 🔄 Updating Your App

To update your app after making code changes:

```bash
# Commit your changes
git add .
git commit -m "Update app"
git push

# Deploy to Fly.io
flyctl deploy
```

---

## 🔧 Troubleshooting

### Issue: "Failed to deploy"

**Solution:**
1. Check the error message
2. Common issues:
   - Wrong Dockerfile path
   - Missing dependencies in requirements.txt
   - Syntax errors in code

### Issue: "Database connection error"

**Solution:**
1. Verify database is attached: `flyctl postgres list`
2. Check DATABASE_URL is set: `flyctl secrets list`
3. Ensure database and app are in same region

### Issue: "Static files not loading"

**Solution:**
1. Check static files configuration in `fly.toml`
2. Ensure `collectstatic` ran in Dockerfile
3. Check `STATIC_ROOT` in settings.py

### Issue: "502 Bad Gateway"

**Solution:**
1. Check app logs: `flyctl logs`
2. Verify gunicorn is running
3. Check internal port matches in `fly.toml`

### Issue: "App is slow to start"

**Solution:**
This is normal on free tier. Apps stop when inactive and take time to start.

---

## 📊 Free Tier Limits

| Feature | Free Tier Limit |
|---------|-----------------|
| **Apps** | 3 free apps |
| **CPU** | 3 shared-cpu-1x VMs (256MB RAM each) |
| **Storage** | 3GB volume storage |
| **Bandwidth** | 160GB egress/month |
| **Database** | PostgreSQL included (1GB) |
| **Regions** | Any region |
| **Sleep** | Apps stop after inactivity |

---

## 🌍 Custom Domain (Optional)

If you have a custom domain:

1. **Add domain to app:**
```bash
flyctl certs create yourdomain.com --app medicine-list-generator
```

2. **Update DNS records:**
Add these to your domain registrar:
```
Type: CNAME
Name: @
Value: medicine-list-generator.fly.dev

Type: CNAME
Name: www
Value: medicine-list-generator.fly.dev
```

3. **Update ALLOWED_HOSTS:**
```bash
flyctl secrets set ALLOWED_HOSTS="yourdomain.com,www.yourdomain.com"
```

---

## 📈 Monitoring Your App

### View Logs
```bash
flyctl logs
```

### View App Status
```bash
flyctl status
```

### View Database Status
```bash
flyctl postgres list
```

### Open App in Browser
```bash
flyctl open
```

---

## 💡 Tips

### Keep App Awake
Free tier apps sleep when inactive. To keep it awake:
1. Use external monitoring (UptimeRobot is free)
2. Set up a cron job to ping it regularly

### Reduce Cold Starts
- Minimize dependencies
- Optimize Dockerfile
- Use smaller base images

### Database Backups
Fly.io automatically backs up PostgreSQL databases:
- Daily backups kept for 7 days
- Manual backups available via `flyctl`

---

## 🎉 Congratulations!

Your Medicine List Generator is now live at:
```
https://medicine-list-generator.fly.dev
```

**Features you get:**
- ✅ Free hosting
- ✅ No credit card required
- ✅ PostgreSQL database
- ✅ Automatic HTTPS/SSL
- ✅ Custom domain support
- ✅ Global deployment options

---

## 📚 Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io Django Guide](https://fly.io/docs/django/)
- [Fly.io PostgreSQL Guide](https://fly.io/docs/postgres/)

---

## ✅ Deployment Checklist

- [ ] Installed Fly CLI
- [ ] Created Fly.io account
- [ ] Updated Django settings
- [ ] Created requirements.txt
- [ ] Created Dockerfile
- [ ] Created fly.toml
- [ ] Initialized Fly app
- [ ] Created PostgreSQL database
- [ ] Attached database to app
- [ ] Set environment variables
- [ ] Deployed app
- [ ] Ran migrations
- [ ] Created superuser
- [ ] Tested all functionality

---

## 🆘 Need Help?

If you encounter issues:
1. Check logs: `flyctl logs`
2. Visit Fly.io community: https://community.fly.io
3. Check documentation: https://fly.io/docs/

Good luck with your deployment! 🚀
