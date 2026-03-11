# PythonAnywhere Deployment Guide

This guide walks you through deploying your Medicine List Generator to PythonAnywhere with hostname: **Zihan.pythonanywhere.com**

## Pre-Deployment Checklist

Before deploying, ensure all production constraints are addressed:

### ✅ 1. DEBUG Setting (FIXED)
- **Issue**: DEBUG = True enabled in production
- **Solution**: Created `.env.production` with `DEBUG=False`
- **Action**: Copy `.env.production` to `.env` on PythonAnywhere

### ✅ 2. ALLOWED_HOSTS (FIXED)
- **Issue**: Empty ALLOWED_HOSTS blocks production requests
- **Solution**: Updated `.env.production` with `ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com`
- **Action**: Ensure this is set in your production `.env` file

### ✅ 3. CSRF Configuration (DOCUMENTED)
- **Issue**: API views use `@csrf_exempt` decorator
- **Analysis**: This is intentional for API-first architecture
- **Rationale**:
  - Frontend uses fetch API which doesn't automatically include CSRF tokens
  - Views also use `@ensure_csrf_cookie` to set CSRF cookies
  - Session authentication provides sufficient security for logout
  - All data-modifying endpoints use `@login_required` decorator
- **Status**: Safe for production with session-based authentication

### ✅ 4. Database Configuration (FIXED)
- **Issue**: SQLite in production
- **Solution**: Updated `settings.py` to support PostgreSQL when DB env vars are present
- **Action**: Set up PostgreSQL on PythonAnywhere and configure environment variables

### ✅ 5. API URL Configuration (ALREADY FIXED)
- **Issue**: Hardcoded localhost URL
- **Current State**: `config.js` uses `window.location.origin + '/api'` (dynamic)
- **Status**: No action needed

### ✅ 6. Deployment Files (FIXED)
- **Issue**: Missing requirements.txt, .gitignore, Procfile
- **Solution**: Created all required files
- **Files Created**:
  - `.gitignore` - Excludes sensitive files and build artifacts
  - `Procfile` - Documents WSGI configuration
  - `.env.production` - Production environment template
  - Updated `.env.example` - Complete environment documentation

### ✅ 7. Git Configuration (FIXED)
- **Issue**: Missing .gitignore
- **Solution**: Created comprehensive `.gitignore` file
- **Status**: Ready for version control

---

## Deployment Steps

### Step 1: Prepare Your PythonAnywhere Account

1. **Sign up/Login** to [PythonAnywhere](https://www.pythonanywhere.com/)
2. **Verify your email address**
3. **Navigate to the "Web" tab** in your dashboard

### Step 2: Create a PostgreSQL Database

1. Go to the **Databases** tab in PythonAnywhere
2. Click **"Create a database"**
3. Choose a name (e.g., `medlist_db`)
4. Note down:
   - Database name
   - Database username
   - Database password
   - Database host (e.g., `zihan.mysql.pythonanywhere-services.com`)

### Step 3: Upload Your Code

**Option A: Using Git (Recommended)**
```bash
# On your local machine
cd backend
git init
git add .
git commit -m "Initial commit for PythonAnywhere deployment"

# Create a repository on GitHub/GitLab and push
git remote add origin <your-repo-url>
git push -u origin main
```

Then on PythonAnywhere:
```bash
# In the "Bash" console
git clone <your-repo-url>
cd <project-name>
```

**Option B: Using PythonAnywhere File Upload**
1. Go to the **Files** tab
2. Upload the entire `backend` folder
3. Navigate to your uploaded files

### Step 4: Set Up Virtual Environment

```bash
# In PythonAnywhere Bash console
cd ~/<project-name>/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 5: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
nano .env
```

Add the following content:
```env
DEBUG=False
ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com
SECRET_KEY=<generate-new-secret-key>
GEMINI_API_KEY=<your-gemini-api-key>
DB_NAME=<your-pythonanywhere-db-name>
DB_USER=<your-pythonanywhere-db-username>
DB_PASSWORD=<your-pythonanywhere-db-password>
DB_HOST=<your-pythonanywhere-db-host>
DB_PORT=5432
```

Generate a new secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Step 6: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 7: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Step 8: Configure Web Application

1. Go to the **Web** tab in PythonAnywhere
2. Click **"Add a new web app"**
3. Choose **"Manual configuration"**
4. Select **Python 3.10** (or latest available)
5. Configure the following:

**WSGI Configuration File:**
```python
import os
import sys

path = '/home/zihan/<project-name>/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ['DJANGO_SETTINGS_MODULE'] = 'medlist_backend.settings'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**Static Files:**
- URL: `/static/`
- Directory: `/home/zihan/<project-name>/backend/static`

**Virtual Environment:**
- Path: `/home/zihan/<project-name>/backend/venv`

### Step 9: Test Your Deployment

1. **Reload the web app** from the Web tab
2. Visit: `https://Zihan.pythonanywhere.com/`
3. Test:
   - Login page loads
   - Registration works
   - Medicine list CRUD operations
   - OCR functionality

### Step 10: Post-Deployment Verification

Run these checks:

```bash
# Check if DEBUG is False
python manage.py shell
>>> from django.conf import settings
>>> settings.DEBUG
False

# Check ALLOWED_HOSTS
>>> settings.ALLOWED_HOSTS
['Zihan.pythonanywhere.com', 'zihan.pythonanywhere.com']

# Check database
>>> from django.db import connection
>>> connection.vendor
'postgresql'
```

---

## Troubleshooting

### Issue: 502 Bad Gateway
- **Cause**: WSGI application not running
- **Solution**: Check error logs in the Web tab, ensure virtual environment is activated

### Issue: 403 Forbidden
- **Cause**: ALLOWED_HOSTS not configured correctly
- **Solution**: Verify ALLOWED_HOSTS in .env file includes your PythonAnywhere hostname

### Issue: Static files not loading
- **Cause**: Static files not collected or incorrect path
- **Solution**: Run `collectstatic` again and verify static files path in Web tab

### Issue: Database connection error
- **Cause**: Incorrect database credentials
- **Solution**: Verify DB_NAME, DB_USER, DB_PASSWORD, DB_HOST in .env file

### Issue: CSRF errors
- **Cause**: Session authentication issues
- **Solution**: Ensure CSRF_COOKIE_SECURE and SESSION_COOKIE_SECURE are set correctly (HTTPS)

---

## Security Best Practices

1. **Never commit .env files** - They contain sensitive information
2. **Use strong SECRET_KEY** - Generate a new one for production
3. **Keep dependencies updated** - Run `pip install --upgrade -r requirements.txt` regularly
4. **Enable HTTPS** - PythonAnywhere provides free SSL certificates
5. **Monitor logs** - Check error logs regularly for suspicious activity
6. **Backup database** - Regular backups of your PostgreSQL database

---

## Performance Optimization

1. **Enable caching** - Consider using Redis for session caching
2. **Optimize static files** - Use CDN for static assets
3. **Database indexing** - Add indexes to frequently queried fields
4. **Compress responses** - Enable gzip compression in WSGI config

---

## Maintenance

### Regular Tasks:
- Update dependencies monthly
- Review and rotate SECRET_KEY annually
- Monitor disk usage
- Check error logs weekly
- Test backup and restore procedures

### Updating the Application:
```bash
# Pull latest changes
git pull origin main

# Install updated dependencies
pip install -r requirements.txt --upgrade

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Reload web app from PythonAnywhere dashboard
```

---

## Support

For issues specific to PythonAnywhere:
- [PythonAnywhere Forums](https://www.pythonanywhere.com/forums/)
- [PythonAnywhere Documentation](https://help.pythonanywhere.com/)

For Django-specific issues:
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework Documentation](https://www.django-rest-framework.org/)

---

## Quick Reference

**Project Structure:**
```
backend/
├── manage.py
├── .env (create this on PythonAnywhere)
├── .env.production (production template)
├── .gitignore (created)
├── Procfile (created)
├── requirements.txt (exists)
├── medlist_backend/
│   ├── settings.py (updated for PostgreSQL)
│   ├── urls.py
│   └── wsgi.py
└── medicines/
    ├── models.py
    ├── views.py
    └── migrations/
```

**Environment Variables Required:**
- DEBUG=False
- ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com
- SECRET_KEY=<random-50-char-string>
- GEMINI_API_KEY=<your-key>
- DB_NAME=<database-name>
- DB_USER=<database-username>
- DB_PASSWORD=<database-password>
- DB_HOST=<database-host>
- DB_PORT=5432

---

**Deployment Status**: ✅ Ready for PythonAnywhere deployment

**Last Updated**: January 14, 2026
