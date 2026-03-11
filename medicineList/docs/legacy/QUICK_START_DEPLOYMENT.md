# Quick Start: Deploy Medicine List Generator to Render.com

## 🚀 5-Minute Overview

This is a condensed guide to get your app live quickly. For detailed instructions, see [`DEPLOYMENT_GUIDE_RENDER.md`](DEPLOYMENT_GUIDE_RENDER.md).

---

## ⚡ Quick Steps

### 1. Update Django Settings (5 min)

Edit [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py):

```python
import os
from dotenv import load_dotenv
import dj_database_url

load_dotenv()

SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-key')
DEBUG = os.environ.get('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(',')

# Add whitenoise to INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps ...
    'whitenoise.runserver_nostatic',
    'medicines',
]

# Add whitenoise to MIDDLEWARE (after SecurityMiddleware)
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    # ... rest of middleware ...
]

# Database
DATABASES = {
    'default': dj_database_url.config(default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'))
}

# Static files
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Security (only when DEBUG=False)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
```

### 2. Create Required Files (3 min)

#### [`backend/requirements.txt`](backend/requirements.txt):
```txt
Django==5.0.1
python-dotenv==1.0.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
whitenoise==6.6.0
dj-database-url==2.1.0
```

#### [`Procfile`](Procfile) (in project root):
```txt
web: cd backend && gunicorn medlist_backend.wsgi:application --bind 0.0.0.0:$PORT
```

#### [`.gitignore`](.gitignore):
```gitignore
.env
__pycache__/
*.pyc
db.sqlite3
staticfiles/
```

### 3. Fix Frontend API URL (1 min)

Edit [`medicineList_generator/config.js`](medicineList_generator/config.js):

```javascript
const API_BASE_URL = window.location.origin + '/api';
```

### 4. Push to GitHub (5 min)

```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/medicine-list-generator.git
git branch -M main
git push -u origin main
```

### 5. Deploy to Render (10 min)

1. **Sign up** at [render.com](https://render.com) with GitHub

2. **Create PostgreSQL Database**:
   - Click "New +" → "PostgreSQL"
   - Name: `medlist-db`
   - Click "Create Database"
   - Save the **Internal Database URL**

3. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - Configure:
     - **Name**: `medicine-list-generator`
     - **Runtime**: Python 3
     - **Build Command**: `cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput`
     - **Start Command**: `cd backend && gunicorn medlist_backend.wsgi:application --bind 0.0.0.0:$PORT`

4. **Add Environment Variables** (click "Advanced"):

   | Key | Value |
   |-----|-------|
   | `SECRET_KEY` | Run: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `medicine-list-generator.onrender.com` |
   | `DATABASE_URL` | (Paste from step 2) |
   | `GEMINI_API_KEY` | Your API key |

5. Click "Create Web Service" and wait for deployment (~3-5 min)

### 6. Run Migrations (2 min)

1. Go to your web service on Render
2. Click "Shell"
3. Run:
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

### 7. Test Your App (2 min)

Open your app URL: `https://medicine-list-generator.onrender.com`

Test:
- [ ] Register new account
- [ ] Login
- [ ] Add medicine
- [ ] Generate PDF

---

## 🎯 What You Get

| Feature | Status |
|---------|--------|
| Free Hosting | ✅ 750 hours/month |
| PostgreSQL Database | ✅ 90 days free, then ~$7/month |
| HTTPS/SSL | ✅ Automatic |
| Custom Domain | ✅ Supported |
| Auto-deploys | ✅ On git push |
| Static Files | ✅ Served via whitenoise |

---

## 📋 Free Tier Limits

**Web Service:**
- 512MB RAM
- Sleeps after 15 min inactivity
- 100GB bandwidth/month

**PostgreSQL:**
- 1GB storage
- 256MB RAM
- 90 days free

---

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| App won't start | Check logs, verify env vars |
| Static files missing | Run `collectstatic` |
| Database error | Verify `DATABASE_URL` |
| CSRF errors | Add `CSRF_TRUSTED_ORIGINS` in settings |

---

## 📚 Full Documentation

- **Production Checklist**: [`PRODUCTION_READINESS_CHECKLIST.md`](PRODUCTION_READINESS_CHECKLIST.md)
- **Detailed Deployment Guide**: [`DEPLOYMENT_GUIDE_RENDER.md`](DEPLOYMENT_GUIDE_RENDER.md)

---

## ✅ Done!

Your Medicine List Generator is live at:
`https://medicine-list-generator.onrender.com`

🎉 **Congratulations!**
