# PythonAnywhere Deployment: What's Next?

## ✅ Great! You've Signed Up

Now let's get your Medicine List Generator deployed!

---

## 🎯 Step-by-Step Guide

### Step 1: Prepare Your Code (Do This Now)

Before uploading to PythonAnywhere, let me make the necessary code changes.

**I'll update these files:**
1. [`backend/medlist_backend/settings.py`](backend/medlist_backend/settings.py) - Update ALLOWED_HOSTS
2. [`backend/requirements.txt`](backend/requirements.txt) - Create if not exists

**You'll need to update:**
1. [`medicineList_generator/config.js`](medicineList_generator/config.js) - Fix API URL

---

### Step 2: Upload Your Code to PythonAnywhere

**Option A: Upload via Web Interface (Easier)**

1. Go to PythonAnywhere dashboard
2. Click **"Files"** tab
3. Navigate to your home directory
4. Click **"Upload a file"** or **"Upload a directory"**
5. Upload your entire `medicineList_generator` folder
6. Upload your entire `backend` folder

**Option B: Upload via Git (If you have GitHub)**

1. Go to PythonAnywhere dashboard
2. Click **"Consoles"** tab
3. Click **"Bash"** to open a bash console
4. Run:
```bash
cd ~
git clone https://github.com/YOUR_USERNAME/medicine-list-generator.git
```

---

### Step 3: Create Virtual Environment

1. Go to PythonAnywhere dashboard
2. Click **"Consoles"** tab
3. Click **"Bash"** to open a bash console
4. Run these commands:

```bash
cd ~/medicine-list-generator/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
```

---

### Step 4: Install Dependencies

In the same bash console (with venv activated):

```bash
cd ~/medicine-list-generator/backend
source venv/bin/activate
pip install -r requirements.txt
```

Wait for all packages to install.

---

### Step 5: Run Database Migrations

In the same bash console:

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

### Step 6: Create Superuser (Admin Account)

In the same bash console:

```bash
cd ~/medicine-list-generator/backend
source venv/bin/activate
python manage.py createsuperuser
```

Follow the prompts:
- **Username:** Your admin username
- **Email:** Your email
- **Password:** Create a secure password

---

### Step 7: Collect Static Files

In the same bash console:

```bash
cd ~/medicine-list-generator/backend
source venv/bin/activate
python manage.py collectstatic --noinput
```

This will copy all static files to the `staticfiles` directory.

---

### Step 8: Configure Web App

1. Go to PythonAnywhere dashboard
2. Click **"Web"** tab
3. Click **"Add a new web app"**
4. Fill in the form:

| Field | Value |
|-------|--------|
| **Web app name** | Leave as default or enter `medicine-list-generator` |
| **Domain** | `yourusername.pythonanywhere.com` (auto-filled) |
| **Framework** | **Django** |
| **Python version** | **3.11** (or 3.12) |
| **Project directory** | `/home/yourusername/medicine-list-generator/backend` |
| **Virtualenv** | `/home/yourusername/medicine-list-generator/backend/venv` |

5. Click **"Next"**
6. Click **"Create"**

---

### Step 9: Update WSGI Configuration

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

**IMPORTANT:** Replace `yourusername` with your actual PythonAnywhere username!

4. Click **"Save"**

---

### Step 10: Configure Static Files

1. In the **"Web"** tab, scroll down to **"Static files"**
2. Click **"Add a new static files entry"**
3. Fill in:
   - **URL:** `/static/`
   - **Directory:** `/home/yourusername/medicine-list-generator/backend/staticfiles`
4. Click **"Save"**

**IMPORTANT:** Replace `yourusername` with your actual PythonAnywhere username!

---

### Step 11: Reload Your Web App

1. In the **"Web"** tab, click the big green **"Reload"** button at the top
2. Wait a few seconds for the app to reload

---

### Step 12: Access Your Application

Open your browser and go to:
```
https://yourusername.pythonanywhere.com
```

Replace `yourusername` with your actual PythonAnywhere username.

---

## ✅ Testing Your Deployment

Test all features:

1. **Login Page**
   - Go to your app URL
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
2. Verify the static files directory path in web app settings
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
3. Reload the web app

---

## 📝 Quick Reference

| Task | Command |
|-------|----------|
| **Activate venv** | `source venv/bin/activate` |
| **Install dependencies** | `pip install -r requirements.txt` |
| **Run migrations** | `python manage.py migrate` |
| **Create superuser** | `python manage.py createsuperuser` |
| **Collect static files** | `python manage.py collectstatic --noinput` |
| **Reload web app** | Click "Reload" button in Web tab |

---

## 🎉 Congratulations!

Your Medicine List Generator is now live at:
```
https://yourusername.pythonanywhere.com
```

---

## 🚀 What I Can Help With

I can help you with:
- ✅ Updating Django settings
- ✅ Creating requirements.txt
- ✅ Fixing the API URL in config.js
- ✅ Troubleshooting any issues

**What I cannot do:**
- ❌ Upload files to PythonAnywhere (requires web interface)
- ❌ Configure web app (requires web interface)
- ❌ Run commands in PythonAnywhere console

---

## 📞 Need Help?

If you encounter issues:
1. Check the error logs in the **"Web"** tab
2. Review PythonAnywhere help pages: [help.pythonanywhere.com](https://help.pythonanywhere.com/)
3. Ask in PythonAnywhere forums

---

**Ready to start? Let me know and I'll help with the code changes!** 🚀
