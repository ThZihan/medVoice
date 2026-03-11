# PythonAnywhere Manual Configuration - Step-by-Step Guide

This guide walks you through manually configuring your Medicine List Generator on PythonAnywhere.

## Step 1: Create Web App with Manual Configuration

1. Go to the **Web** tab in PythonAnywhere
2. Click **"Add a new web app"**
3. Click **"Next"** on the domain selection (use default)
4. Select **"Manual configuration (including virtualenvs)"**
5. Select **Python 3.10** (or latest available 3.x version)
6. Click **"Next"**

PythonAnywhere will now create your web app with default settings.

---

## Step 2: Create and Configure Virtual Environment

### 2.1 Open a Bash Console
1. Go to the **Consoles** tab
2. Click **"Bash"**
3. A new bash console will open

### 2.2 Navigate to Your Project Directory
```bash
cd ~
```

### 2.3 Upload Your Project Files

**Option A: Using Git (Recommended)**
```bash
# Clone your repository
git clone <your-repository-url> medicineList_generator

# Navigate to backend
cd medicineList_generator/backend
```

**Option B: Using PythonAnywhere File Upload**
1. Go to the **Files** tab
2. Upload the entire `backend` folder to your home directory
3. In bash, navigate to it:
```bash
cd ~/backend
```

### 2.4 Create Virtual Environment
```bash
python3 -m venv venv
```

### 2.5 Activate Virtual Environment
```bash
source venv/bin/activate
```

You should see `(venv)` in your command prompt.

### 2.6 Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

This will install:
- Django==5.0.1
- djangorestframework==3.14.0
- psycopg2-binary==2.9.9
- python-decouple==3.8

---

## Step 3: Set Up PostgreSQL Database

### 3.1 Create Database
1. Go to the **Databases** tab in PythonAnywhere
2. Click **"Create a database"**
3. Choose a name (e.g., `medlist_db`)
4. Click **"Create database"**

### 3.2 Note Your Database Credentials
You'll see something like:
```
Database name: zihan$medlist_db
Database host: zihan.mysql.pythonanywhere-services.com
Database username: zihan
Database password: your-generated-password
```

**Save these credentials!** You'll need them for the next step.

---

## Step 4: Configure Environment Variables

### 4.1 Create .env File
```bash
nano .env
```

### 4.2 Add Environment Variables
Copy and paste the following (replace values with your actual credentials):

```env
# Django Configuration
DEBUG=False
ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com

# Generate a new secret key
SECRET_KEY=your-generated-secret-key-here

# Google Gemini API Configuration
GEMINI_API_KEY=your-gemini-api-key-here

# PostgreSQL Database Configuration
DB_NAME=zihan$medlist_db
DB_USER=zihan
DB_PASSWORD=your-database-password-here
DB_HOST=zihan.mysql.pythonanywhere-services.com
DB_PORT=5432
```

### 4.3 Generate Secret Key
In a separate bash console or terminal:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Copy the output and paste it as your `SECRET_KEY` in the `.env` file.

### 4.4 Save and Exit
- Press `Ctrl+O` then `Enter` to save
- Press `Ctrl+X` to exit nano

---

## Step 5: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

You should see output like:
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, medicines, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

---

## Step 6: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

You should see:
```
Copying static files...
62 static files copied to '/home/zihan/medicineList_generator/backend/static'.
```

---

## Step 7: Configure WSGI File

### 7.1 Open WSGI Configuration
1. Go to the **Web** tab
2. Scroll down to **"Code"** section
3. Click the link to your WSGI configuration file (e.g., `/var/www/zihan_pythonanywhere_com_wsgi.py`)

### 7.2 Replace the Entire Content
Delete everything and replace with:

```python
import os
import sys

# Add your project to the Python path
path = '/home/zihan/medicineList_generator/backend'
if path not in sys.path:
    sys.path.append(path)

# Set the Django settings module
os.environ['DJANGO_SETTINGS_MODULE'] = 'medlist_backend.settings'

# Import Django and get WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

**Important**: Replace `zihan` with your actual PythonAnywhere username if different.

### 7.3 Save the File
- Click **"Save"** or use the save button in the editor

---

## Step 8: Configure Virtual Environment Path

1. Go to the **Web** tab
2. Scroll down to **"Virtualenv"** section
3. Enter the path: `/home/zihan/medicineList_generator/backend/venv`
4. Click **"OK"** to save

**Important**: Replace `zihan` with your actual PythonAnywhere username.

---

## Step 9: Configure Static Files

1. Go to the **Web** tab
2. Scroll down to **"Static files"** section
3. Click **"Enter URL"** and enter: `/static/`
4. Click **"Enter directory"** and enter: `/home/zihan/medicineList_generator/backend/static`
5. Click **"Save"**

**Important**: Replace `zihan` with your actual PythonAnywhere username.

---

## Step 10: Reload Web App

1. Go to the **Web** tab
2. Scroll to the top
3. Click the big green **"Reload"** button
4. Wait for the reload to complete (usually 10-20 seconds)

---

## Step 11: Test Your Deployment

### 11.1 Visit Your Site
Open your browser and go to: `https://Zihan.pythonanywhere.com/`

### 11.2 Test Functionality
- [ ] Login page loads
- [ ] Registration works
- [ ] Can log in with registered account
- [ ] Medicine list displays
- [ ] Can add new medicine
- [ ] Can delete medicine
- [ ] OCR functionality works (if configured)

---

## Step 12: Verify Production Settings

### 12.1 Check DEBUG is False
1. Right-click on your site and select **"View Page Source"**
2. Search for "DEBUG" - you should NOT see detailed error messages
3. If you see Django error pages, they should be generic, not detailed

### 12.2 Check ALLOWED_HOSTS
If you try to access via IP address instead of hostname, you should get a "DisallowedHost" error (this is correct behavior).

### 12.3 Check Database
In bash console:
```bash
source ~/medicineList_generator/backend/venv/bin/activate
cd ~/medicineList_generator/backend
python manage.py shell
>>> from django.db import connection
>>> connection.vendor
'postgresql'
>>> exit()
```

---

## Troubleshooting

### Issue: 502 Bad Gateway
**Cause**: WSGI application not running or misconfigured

**Solution**:
1. Check error logs in Web tab
2. Verify virtualenv path is correct
3. Ensure all dependencies are installed
4. Check WSGI file syntax

### Issue: 403 Forbidden
**Cause**: ALLOWED_HOSTS not configured correctly

**Solution**:
1. Check `.env` file has correct ALLOWED_HOSTS
2. Verify hostname matches exactly (case-sensitive)
3. Reload web app after changes

### Issue: Static files not loading (404)
**Cause**: Static files not collected or wrong path

**Solution**:
1. Run `python manage.py collectstatic --noinput` again
2. Verify static files path in Web tab
3. Check that static directory exists and has files

### Issue: Database connection error
**Cause**: Incorrect database credentials

**Solution**:
1. Verify DB_NAME, DB_USER, DB_PASSWORD, DB_HOST in `.env`
2. Ensure database was created in Databases tab
3. Check that password is correct (no extra spaces)

### Issue: ModuleNotFoundError
**Cause**: Missing dependencies

**Solution**:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: Permission denied
**Cause**: File permissions issue

**Solution**:
```bash
chmod 600 .env  # Only owner can read/write
chmod 755 ~/medicineList_generator/backend
```

---

## Post-Deployment Checklist

- [ ] Site loads at https://Zihan.pythonanywhere.com/
- [ ] Login page displays correctly
- [ ] Registration creates new user
- [ ] Can log in and see dashboard
- [ ] Medicine CRUD operations work
- [ ] Static files (CSS, JS) load correctly
- [ ] No error messages in browser console
- [ ] No errors in PythonAnywhere error logs
- [ ] Database is PostgreSQL (not SQLite)
- [ ] DEBUG is False (check page source)

---

## Maintenance Commands

### Update Application
```bash
cd ~/medicineList_generator/backend
source venv/bin/activate
git pull origin main
pip install -r requirements.txt --upgrade
python manage.py migrate
python manage.py collectstatic --noinput
```

Then reload web app from dashboard.

### Check Logs
```bash
tail -f /var/log/zihan.pythonanywhere.com.error.log
tail -f /var/log/zihan.pythonanywhere.com.access.log
```

### Create Superuser (for Django Admin)
```bash
cd ~/medicineList_generator/backend
source venv/bin/activate
python manage.py createsuperuser
```

---

## Security Notes

### Important Security Practices

1. **Never commit .env files** - They contain sensitive information
2. **Keep SECRET_KEY secure** - Don't share it publicly
3. **Rotate SECRET_KEY annually** - Generate a new one and update .env
4. **Use HTTPS** - PythonAnywhere provides free SSL certificates
5. **Monitor logs regularly** - Check for suspicious activity
6. **Keep dependencies updated** - Run upgrades monthly

### What's Protected
✅ Environment variables (not in git)
✅ Database credentials (in .env, gitignored)
✅ API keys (in .env, gitignored)
✅ Secret key (unique per deployment)

### What's Public
⚠️ Frontend JavaScript (accessible via browser)
⚠️ Static files (CSS, JS, images)
⚠️ API endpoints (documented in code)

---

## Quick Reference

### Project Structure on PythonAnywhere
```
/home/zihan/
└── medicineList_generator/
    └── backend/
        ├── manage.py
        ├── .env (create this)
        ├── .gitignore
        ├── Procfile
        ├── requirements.txt
        ├── static/ (created by collectstatic)
        ├── venv/ (virtual environment)
        ├── medlist_backend/
        │   ├── settings.py
        │   ├── urls.py
        │   └── wsgi.py
        └── medicines/
            ├── models.py
            ├── views.py
            └── migrations/
```

### Environment Variables Required
```env
DEBUG=False
ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com
SECRET_KEY=<your-generated-key>
GEMINI_API_KEY=<your-api-key>
DB_NAME=zihan$medlist_db
DB_USER=zihan
DB_PASSWORD=<your-db-password>
DB_HOST=zihan.mysql.pythonanywhere-services.com
DB_PORT=5432
```

### Key Paths (replace zihan with your username)
- Project: `/home/zihan/medicineList_generator/backend`
- Virtualenv: `/home/zihan/medicineList_generator/backend/venv`
- Static files: `/home/zihan/medicineList_generator/backend/static`
- WSGI config: `/var/www/zihan_pythonanywhere_com_wsgi.py`

---

## Support Resources

### PythonAnywhere
- [Documentation](https://help.pythonanywhere.com/)
- [Forums](https://www.pythonanywhere.com/forums/)
- [Status Page](https://www.pythonanywhere.com/status/)

### Django
- [Documentation](https://docs.djangoproject.com/)
- [Deployment Checklist](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/)
- [Security Guide](https://docs.djangoproject.com/en/5.0/topics/security/)

---

**Next Steps**: Follow this guide step by step. If you encounter any issues, check the troubleshooting section or refer to the error logs in your PythonAnywhere Web tab.

**Good luck with your deployment! 🚀**
