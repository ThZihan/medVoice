# Step-by-Step Deployment Guide: Render.com

This guide will walk you through deploying your Medicine List Generator to Render.com for free.

---

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] A GitHub account
- [ ] Git installed on your computer
- [ ] A Render.com account (sign up at [render.com](https://render.com))

---

## Phase 1: Prepare Your Code for Production

### Step 1: Update Django Settings

Open [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) and make these changes:

```python
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-fallback-key-for-dev')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# IMPORTANT: Configure ALLOWED_HOSTS for production
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
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this after SecurityMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database configuration for production
import dj_database_url

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static files configuration
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / '../medicineList_generator',
]

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

# Logging configuration
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
        'console': {
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
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}
```

### Step 2: Create requirements.txt

Create a file named [`backend/requirements.txt`](backend/requirements.txt):

```txt
Django==5.0.1
python-dotenv==1.0.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
whitenoise==6.6.0
Pillow==10.1.0
dj-database-url==2.1.0
```

### Step 3: Create Procfile

Create a file named [`Procfile`](Procfile) in the project root (not in backend folder):

```txt
web: cd backend && gunicorn medlist_backend.wsgi:application --bind 0.0.0.0:$PORT
```

### Step 4: Create .gitignore

Create or update [`.gitignore`](.gitignore) in the project root:

```gitignore
# Environment variables
.env
.env.local

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
db.sqlite3
db.sqlite3-journal
/staticfiles/
/media/

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
screenshots/
*.png
*.jpg
*.jpeg
```

### Step 5: Update Frontend API URL

Open [`medicineList_generator/config.js`](medicineList_generator/config.js) and update:

```javascript
// ===================================
// SHARED CONFIGURATION
// ===================================

// API Configuration - Use relative path for production compatibility
const API_BASE_URL = window.location.origin + '/api';
```

### Step 6: Create Production Environment File Template

Create [`backend/.env.production`](backend/.env.production):

```env
# Django Configuration
SECRET_KEY=generate-with-python-manage-py-generate-secret-key
DEBUG=False
ALLOWED_HOSTS=your-app-name.onrender.com

# Google Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# Admin URL (change this to something secret)
ADMIN_URL=med-admin-xyz/
```

---

## Phase 2: Set Up GitHub Repository

### Step 1: Initialize Git (if not already done)

Open your terminal in the project root:

```bash
git init
```

### Step 2: Add All Files

```bash
git add .
```

### Step 3: Create Initial Commit

```bash
git commit -m "Initial commit: Medicine List Generator"
```

### Step 4: Create GitHub Repository

1. Go to [github.com](https://github.com) and log in
2. Click the "+" button in the top-right corner
3. Select "New repository"
4. Name it: `medicine-list-generator`
5. Make it **Private** (recommended)
6. Click "Create repository"

### Step 5: Push to GitHub

Copy the commands from GitHub and run them in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/medicine-list-generator.git
git branch -M main
git push -u origin main
```

---

## Phase 3: Set Up Render.com

### Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Render to access your GitHub account

### Step 2: Create PostgreSQL Database

1. After logging in, click "New +"
2. Select "PostgreSQL"
3. Fill in the form:
   - **Name**: `medlist-db`
   - **Database**: `medlist`
   - **User**: `medlist_user`
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 16 (latest)
4. Click "Create Database"
5. Wait for the database to be created (green status)

6. **Important**: Save these connection details:
   - Internal Database URL (you'll see it in the dashboard)
   - External Database URL (for local development if needed)

### Step 3: Create Web Service

1. Click "New +" again
2. Select "Web Service"
3. Connect your GitHub repository:
   - Under "Build and deploy from a Git repository"
   - Click "Connect GitHub"
   - Find and select `medicine-list-generator`
   - Click "Connect"

4. Configure the web service:
   - **Name**: `medicine-list-generator`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Runtime**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `cd backend && gunicorn medlist_backend.wsgi:application --bind 0.0.0.0:$PORT`

5. **IMPORTANT**: Click "Advanced" and add these environment variables:

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | Generate one: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `medicine-list-generator.onrender.com` (will update after deployment) |
   | `DATABASE_URL` | (Get from your PostgreSQL database page - Internal Database URL) |
   | `GEMINI_API_KEY` | Your Google Gemini API key |

6. Click "Create Web Service"

7. Wait for deployment (takes 2-5 minutes)

---

## Phase 4: Post-Deployment Configuration

### Step 1: Run Database Migrations

1. Go to your web service dashboard on Render
2. Click "Shell" (you may need to deploy first)
3. Run these commands:

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### Step 2: Update ALLOWED_HOSTS

1. After deployment completes, copy your app URL (e.g., `https://medicine-list-generator.onrender.com`)
2. Go to your web service settings
3. Update `ALLOWED_HOSTS` environment variable:
   ```
   medicine-list-generator.onrender.com,www.medicine-list-generator.onrender.com
   ```

### Step 3: Test Your Application

1. Open your app URL in a browser
2. Try:
   - Registering a new account
   - Logging in
   - Adding medicines
   - Generating PDF
   - Testing OCR feature

---

## Phase 5: Custom Domain (Optional)

If you want to use your own domain:

### Step 1: Purchase a Domain

Buy a domain from any registrar (Namecheap, GoDaddy, etc.)

### Step 2: Add Custom Domain on Render

1. Go to your web service settings
2. Click "Custom Domains"
3. Click "Add Custom Domain"
4. Enter your domain (e.g., `yourdomain.com`)
5. Click "Add"

### Step 3: Update DNS Records

Render will show you the DNS records to add. Add these to your domain registrar:

```
Type: CNAME
Name: @
Value: cname.render.com

Type: CNAME
Name: www
Value: cname.render.com
```

### Step 4: Update ALLOWED_HOSTS

Update your `ALLOWED_HOSTS` environment variable:
```
yourdomain.com,www.yourdomain.com
```

### Step 5: Enable SSL (Automatic)

Render automatically provisions SSL certificates for custom domains.

---

## Phase 6: Monitoring and Maintenance

### Step 1: Set Up Error Monitoring (Optional but Recommended)

1. Sign up for [Sentry](https://sentry.io) (free tier available)
2. Create a new project for Django
3. Install Sentry SDK:

```bash
pip install sentry-sdk
```

4. Add to [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py):

```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
)
```

5. Add `SENTRY_DSN` to Render environment variables

### Step 2: Set Up Uptime Monitoring

1. Sign up for [UptimeRobot](https://uptimerobot.com) (free)
2. Add a new monitor:
   - Type: HTTPS
   - URL: Your app URL
   - Monitoring Interval: 5 minutes
3. Set up email alerts

### Step 3: Database Backups

Render automatically backs up PostgreSQL databases:
- Daily backups are kept for 7 days
- Weekly backups are kept for 4 weeks

For additional backup strategy, consider:
- Export database regularly: `pg_dump`
- Store in cloud storage (AWS S3, Google Cloud Storage)

---

## 📊 Free Tier Limits on Render

### Web Service
- **Free**: 750 hours/month
- **RAM**: 512MB
- **CPU**: Shared
- **Sleeps**: After 15 minutes of inactivity (spins up in ~30 seconds)
- **Bandwidth**: 100GB/month

### PostgreSQL
- **Free**: 90 days
- **Storage**: 1GB
- **RAM**: 256MB
- **Connections**: 90
- **After 90 days**: ~$7/month

---

## 🐛 Troubleshooting

### Issue: Application won't start

**Solution**: Check the logs in Render dashboard. Common issues:
- Missing environment variables
- Incorrect `ALLOWED_HOSTS`
- Database connection issues

### Issue: Static files not loading

**Solution**: Ensure `whitenoise` is installed and configured correctly. Run:
```bash
python manage.py collectstatic
```

### Issue: Database connection errors

**Solution**: Verify `DATABASE_URL` environment variable matches your PostgreSQL internal URL.

### Issue: CSRF token errors

**Solution**: Ensure `CSRF_TRUSTED_ORIGINS` is set in settings:
```python
CSRF_TRUSTED_ORIGINS = ['https://your-app.onrender.com']
```

### Issue: App sleeps too frequently

**Solution**: Set up a cron job or external pinger to keep it awake. UptimeRobot's monitoring helps with this.

---

## 📝 Additional Resources

- [Render Django Documentation](https://render.com/docs/deploy-django)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

## ✅ Deployment Checklist

- [ ] Updated Django settings for production
- [ ] Created requirements.txt
- [ ] Created Procfile
- [ ] Updated .gitignore
- [ ] Fixed frontend API URL
- [ ] Pushed code to GitHub
- [ ] Created PostgreSQL database on Render
- [ ] Created web service on Render
- [ ] Configured environment variables
- [ ] Ran database migrations
- [ ] Created admin user
- [ ] Tested all functionality
- [ ] Set up monitoring (optional)
- [ ] Configured custom domain (optional)

---

## 🎉 Congratulations!

Your Medicine List Generator is now live! You can access it at:
`https://medicine-list-generator.onrender.com`

(Replace with your actual app URL)
