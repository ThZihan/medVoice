# PythonAnywhere Deployment Guide (Free, No Credit Card)

This guide will walk you through deploying your Medicine List Generator to PythonAnywhere's free tier.

---

## 🎯 Why PythonAnywhere?

| Feature | Status |
|---------|--------|
| **Free Tier** | ✅ Permanently free |
| **Credit Card** | ❌ NOT required |
| **Database** | SQLite (included) |
| **Custom Domain** | ❌ Not on free tier |
| **HTTPS** | ❌ Not on free tier |
| **Setup Difficulty** | ⭐ Very Easy |
| **Your Code Changes** | Minimal |

---

## 📋 Prerequisites

- [ ] PythonAnywhere account (free)
- [ ] Your code on GitHub (optional, but recommended)
- [ ] 30-45 minutes of time

---

## 🚀 Step-by-Step Deployment

### Step 1: Create PythonAnywhere Account

1. Go to [pythonanywhere.com](https://www.pythonanywhere.com)
2. Click **"Create a free account"**
3. Fill in the form:
   - Username: `your-username` (this will be your app URL)
   - Email: your email
   - Password: create a password
4. Click **"Register"**
5. Verify your email address

**No credit card required!**

---

### Step 2: Prepare Your Django Settings

Open [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) and make these minimal changes:

```python
import os
from pathlib import Path

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key-change-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# IMPORTANT: Update ALLOWED_HOSTS with your PythonAnywhere username
# Replace 'yourusername' with your actual PythonAnywhere username
ALLOWED_HOSTS = ['yourusername.pythonanywhere.com']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'medicines',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
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

# Database - Keep SQLite for PythonAnywhere free tier
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
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

# Security settings (even without HTTPS)
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
```

---

### Step 3: Create requirements.txt

Create [`backend/requirements.txt`](backend/requirements.txt):

```txt
Django==5.0.1
python-dotenv==1.0.0
Pillow==10.1.0
```

---

### Step 4: Upload Your Code to PythonAnywhere

You have two options:

#### Option A: Upload via Web Interface (Easier)

1. Go to PythonAnywhere dashboard
2. Click the **"Files"** tab
3. Navigate to your home directory
4. Click **"Upload a file"** or **"Upload a directory"**
5. Upload your entire project folder

#### Option B: Clone from GitHub (Recommended)

1. Go to PythonAnywhere dashboard
2. Click the **"Consoles"** tab
3. Click **"Bash"** to open a bash console
4. Run:
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/medicine-list-generator.git
```

---

### Step 5: Create Virtual Environment

In the Bash console:

```bash
cd ~/medicine-list-generator/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Wait for all packages to install.

---

### Step 6: Run Migrations

In the same Bash console (with venv activated):

```bash
cd ~/medicine-list-generator/backend
source venv/bin/activate
python manage.py migrate
```

You should see:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, medicines, sessions
Running migrations:
  ...
```

---

### Step 7: Create Superuser (Admin User)

```bash
python manage.py createsuperuser
```

Follow the prompts:
- Username: your admin username
- Email: your email
- Password: create a password

---

### Step 8: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

This will copy all static files to the `staticfiles` directory.

---

### Step 9: Configure Web App

1. Go to PythonAnywhere dashboard
2. Click the **"Web"** tab
3. Click **"Add a new web app"**
4. Fill in the form:
   - **Web app name**: Leave as default or enter `medicine-list-generator`
   - **Domain**: `yourusername.pythonanywhere.com`
   - **Framework**: **Django**
   - **Python version**: **3.11** (or 3.12)
   - **Project directory**: `/home/yourusername/medicine-list-generator/backend`
   - **Virtualenv**: `/home/yourusername/medicine-list-generator/backend/venv`
5. Click **"Next"** and then **"Create"**

---

### Step 10: Update WSGI Configuration

1. In the **"Web"** tab, scroll down to **"WSGI configuration file"**
2. Click the link to edit the WSGI file
3. Replace the content with:

```python
import os
import sys

# Add your project directory to Python path
path = '/home/yourusername/medicine-list-generator/backend'
if path not in sys.path:
    sys.path.append(path)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'medlist_backend.settings')

# Import Django and get the WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**Important:** Replace `yourusername` with your actual PythonAnywhere username.

4. Click **"Save"**

---

### Step 11: Configure Static Files

1. In the **"Web"** tab, scroll down to **"Static files"**
2. Click **"Add a new static files entry"**
3. Fill in:
   - **URL**: `/static/`
   - **Directory**: `/home/yourusername/medicine-list-generator/backend/staticfiles`
4. Click **"Save"**

---

### Step 12: Reload Your Web App

1. In the **"Web"** tab, click the big green **"Reload"** button at the top
2. Wait a few seconds for the app to reload

---

### Step 13: Access Your Application

Open your browser and go to:
```
https://yourusername.pythonanywhere.com
```

Replace `yourusername` with your actual PythonAnywhere username.

---

## ✅ Testing Your Deployment

Test all features:

1. **Login Page**
   - Go to `https://yourusername.pythonanywhere.com`
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
   - Go to `https://yourusername.pythonanywhere.com/admin`
   - Login with your superuser credentials
   - Verify you can see the database

---

## 🔧 Troubleshooting

### Issue: "502 Bad Gateway"

**Solution:**
1. Check the error log in the **"Web"** tab
2. Common causes:
   - Wrong path in WSGI configuration
   - Virtualenv not activated
   - Missing dependencies

### Issue: Static files not loading

**Solution:**
1. Run `python manage.py collectstatic --noinput` again
2. Verify static files directory path in web app settings
3. Reload the web app

### Issue: Database errors

**Solution:**
1. Run `python manage.py migrate` again
2. Check that `db.sqlite3` exists in the backend directory
3. Verify file permissions

### Issue: "Module not found" error

**Solution:**
1. Activate virtualenv: `source venv/bin/activate`
2. Install missing package: `pip install package-name`
3. Reload web app

### Issue: App is slow to load

**Solution:**
This is normal on free tier. The app "sleeps" when inactive and takes time to wake up.

---

## 📊 Free Tier Limitations

| Feature | Free Tier Limit |
|---------|-----------------|
| **Web Apps** | 1 web app |
| **RAM** | 512MB |
| **CPU** | Limited |
| **Storage** | 512MB disk space |
| **Requests** | ~10,000 requests/day |
| **HTTPS** | Not available |
| **Custom Domain** | Not available |
| **Database** | SQLite only |

---

## 🔒 Security Notes

### No HTTPS on Free Tier

PythonAnywhere free tier does NOT provide HTTPS. This means:
- Your login credentials are sent in plain text
- Not recommended for sensitive data
- Use strong passwords
- Consider upgrading to paid tier if you need HTTPS

### SQLite Limitations

SQLite is fine for small apps, but has limitations:
- Not ideal for concurrent users
- File-based database
- May have performance issues with many users

---

## 📈 Upgrading from Free Tier

If you need more features, PythonAnywhere paid tiers start at ~$5/month and include:
- HTTPS/SSL
- Custom domain
- PostgreSQL database
- More RAM and CPU
- No sleep timeout

---

## 🎉 Congratulations!

Your Medicine List Generator is now live at:
```
https://yourusername.pythonanywhere.com
```

**Next Steps:**
- Test all functionality
- Share with users
- Consider upgrading if you need HTTPS or more resources

---

## 📚 Additional Resources

- [PythonAnywhere Django Tutorial](https://help.pythonanywhere.com/pages/DeployExistingDjangoProject/)
- [PythonAnywhere Help Pages](https://help.pythonanywhere.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)

---

## ✅ Deployment Checklist

- [ ] Created PythonAnywhere account
- [ ] Updated Django settings
- [ ] Created requirements.txt
- [ ] Uploaded code to PythonAnywhere
- [ ] Created virtual environment
- [ ] Installed dependencies
- [ ] Ran migrations
- [ ] Created superuser
- [ ] Collected static files
- [ ] Configured web app
- [ ] Updated WSGI configuration
- [ ] Configured static files
- [ ] Reloaded web app
- [ ] Tested all functionality

---

## 🆘 Need Help?

If you encounter issues:
1. Check the error logs in the **"Web"** tab
2. Review PythonAnywhere help pages
3. Ask in PythonAnywhere forums

Good luck with your deployment! 🚀
