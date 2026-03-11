# How to Update Git Repository with MySQL Changes

Since we've updated the code to use MySQL instead of PostgreSQL, you need to push these changes to GitHub and then pull them on PythonAnywhere.

## Step 1: Update Local Git Repository (On Your Local Machine)

### 1.1 Navigate to Project Directory
```bash
cd c:/Users/tahfi/OneDrive\ -\ Independent\ University,\ Bangladesh/Documents/medicineList_generator
```

### 1.2 Check Current Git Status
```bash
git status
```

You should see modified files:
```
On branch main
Changes not staged for commit:
  modified:   backend/requirements.txt
  modified:   backend/medlist_backend/settings.py
  modified:   backend/.env.example
  modified:   backend/.env.production
```

### 1.3 Add All Changes
```bash
git add .
```

### 1.4 Commit Changes
```bash
git commit -m "Update to MySQL for PythonAnywhere free tier deployment"
```

### 1.5 Push to GitHub
```bash
git push origin main
```

**Expected output:**
```
Enumerating objects: 15, done.
Counting objects: 100% (15/15), done.
Delta compression using up to 8 threads
Compressing objects: 100% (8/8), done.
Writing objects: 100% (8/8), 1.5 KiB | 1.5 MiB/s, done.
Total 8 (delta 4), reused 0 (delta 0)
To https://github.com/ThZihan/medicineList_generatorV1.git
   abc1234..def5678  main -> main
```

---

## Step 2: Pull Updated Code on PythonAnywhere

### 2.1 Open Bash Console on PythonAnywhere
Go to the **Consoles** tab and open a **Bash** console.

### 2.2 Navigate to Project Directory
```bash
cd ~/medicineList_generatorV1
```

### 2.3 Check Current Branch
```bash
git branch
```

You should see:
```
* main
```

### 2.4 Pull Latest Changes
```bash
git pull origin main
```

**Expected output:**
```
remote: Enumerating objects: 15, done.
remote: Counting objects: 100% (15/15), done.
remote: Compressing objects: 100% (8/8), done.
remote: Total 8 (delta 4), reused 0 (delta 4), pack-reused 0
Unpacking objects: 100% (8/8), 1.5 KiB | 1.5 MiB/s, done.
From https://github.com/ThZihan/medicineList_generatorV1
   abc1234..def5678  main     -> origin/main
Updating abc1234..def5678
Fast-forward
 backend/requirements.txt                         |  2 +-
 backend/medlist_backend/settings.py              | 24 +++++++++++-------------
 backend/.env.example                            |  8 ++--
 backend/.env.production                          |  8 ++--
 4 files changed, 20 insertions(+), 22 deletions(-)
```

### 2.5 Verify Files Are Updated
```bash
cd backend
cat requirements.txt
```

You should see:
```
Django==5.0.1
djangorestframework==3.14.0
mysqlclient==2.2.0
python-decouple==3.8
```

**Important**: You should see `mysqlclient==2.2.0` (not `psycopg2-binary`)

---

## Step 3: Reinstall Dependencies with MySQL Support

### 3.1 Activate Virtual Environment
```bash
cd ~/medicineList_generatorV1/backend
source venv/bin/activate
```

### 3.2 Upgrade pip
```bash
pip install --upgrade pip
```

### 3.3 Install Updated Requirements
```bash
pip install -r requirements.txt
```

**Expected output:**
```
Requirement already satisfied: Django==5.0.1 in ./venv/lib/python3.11/site-packages
Requirement already satisfied: djangorestframework==3.14.0 in ./venv/lib/python3.11/site-packages
Collecting mysqlclient==2.2.0
  Downloading mysqlclient-2.2.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.3 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.3/1.1 MB 8.7 MB/s eta 0:00:00
Installing collected packages: mysqlclient
Successfully installed mysqlclient-2.2.0
Requirement already satisfied: python-decouple==3.8 in ./venv/lib/python3.11/site-packages
```

### 3.4 Verify MySQL Client is Installed
```bash
python -c "import MySQLdb; print('MySQL client installed successfully')"
```

**Expected output:**
```
MySQL client installed successfully
```

---

## Step 4: Update .env File with MySQL Credentials

Based on your database screenshot, your credentials are:

- **Database Name**: `Zihan$medlist_db`
- **Database Username**: `Zihan`
- **Database Password**: `*Arduinox`
- **Database Host**: `Zihan.mysql.pythonanywhere-services.com`
- **Database Port**: `3306`

### 4.1 Edit .env File
```bash
nano .env
```

### 4.2 Update Database Section
Replace the database section with:

```env
DEBUG=False
ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com
SECRET_KEY=*3!-5b1m9x%5urn!r+x*j51$qn@e7!3t29#@gz=7-o20iejm-4
GEMINI_API_KEY=your_gemini_api_key_here

# MySQL Database Configuration
DB_NAME=Zihan$medlist_db
DB_USER=Zihan
DB_PASSWORD=*Arduinox
DB_HOST=Zihan.mysql.pythonanywhere-services.com
DB_PORT=3306
```

**Save:** `Ctrl+O`, `Enter`, then `Ctrl+X`

### 4.3 Verify .env File
```bash
cat .env
```

Make sure all values are correct, especially:
- `DB_NAME=Zihan$medlist_db` (includes `$` symbol)
- `DB_PASSWORD=*Arduinox` (exact password)
- `DB_HOST=Zihan.mysql.pythonanywhere-services.com` (ends with `.mysql.`)
- `DB_PORT=3306` (MySQL port)

---

## Step 5: Run Migrations on MySQL

### 5.1 Make Migrations
```bash
python manage.py makemigrations
```

**Expected output:**
```
No changes detected
```

### 5.2 Apply Migrations
```bash
python manage.py migrate
```

**Expected output:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, medicines, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  Applying admin.0001_initial... OK
  Applying admin.0002_logentry_remove_auto_add... OK
  Applying admin.0003_logentry_add_action_flag_choices... OK
  Applying contenttypes.0002_remove_content_type_name... OK
  Applying auth.0002_alter_permission_name_max_length... OK
  Applying auth.0003_alter_user_email_max_length... OK
  Applying auth.0004_alter_user_username_opts... OK
  Applying auth.0005_alter_user_last_login_null... OK
  Applying auth.0006_require_contenttypes_0002... OK
  Applying auth.0007_alter_validators_add_error_messages... OK
  Applying auth.0008_alter_user_username_max_length... OK
  Applying auth.0009_alter_user_last_name_max_length... OK
  Applying auth.0010_alter_group_name_max_length... OK
  Applying auth.0011_update_proxy_permissions... OK
  Applying auth.0012_alter_user_first_name_max_length... OK
  Applying medicines.0001_initial... OK
  Applying sessions.0001_initial... OK
```

---

## Step 6: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

**Expected output:**
```
Copying static files...
62 static files copied to '/home/Zihan/medicineList_generatorV1/backend/static'.
```

---

## Step 7: Verify MySQL Connection

### 7.1 Check Database Type
```bash
python manage.py shell
>>> from django.db import connection
>>> connection.vendor
'mysql'
>>> exit()
```

**Expected output**: `mysql`

### 7.2 Test Database Connection
```bash
python manage.py dbshell
```

You should see MySQL prompt:
```
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 12345
Server version: 8.0.35 MySQL Community Server

Copyright (c) 2000, 2024, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql>
```

Type `exit` to leave MySQL shell.

### 7.3 Check Tables
```bash
python manage.py dbshell
mysql> SHOW TABLES;
```

You should see Django tables:
```
+---------------------------+
| Tables_in_Zihan$medlist_db |
+---------------------------+
| auth_group                 |
| auth_group_permissions     |
| auth_permission            |
| auth_user                 |
| auth_user_groups          |
| auth_user_user_permissions |
| django_admin_log          |
| django_content_type       |
| django_migrations         |
| django_session           |
| medicines_patient         |
| medicines_usermedicine    |
+---------------------------+
11 rows in set (0.01 sec)
```

Type `exit` to leave MySQL shell.

---

## Step 8: Reload Web App

1. Go to the **Web** tab in PythonAnywhere
2. Click the big green **"Reload"** button
3. Wait 10-20 seconds for reload to complete

---

## Step 9: Test Your Deployment

### 9.1 Visit Your Site
Open your browser and go to: `https://Zihan.pythonanywhere.com/`

### 9.2 Test Functionality
- [ ] Login page loads
- [ ] Can register a new user
- [ ] Can log in with registered account
- [ ] Medicine list displays
- [ ] Can add new medicine
- [ ] Can delete medicine
- [ ] Data persists (refresh page and check)

### 9.3 Verify Data is in MySQL
```bash
python manage.py dbshell
mysql> SELECT * FROM medicines_patient;
```

You should see any registered users.

---

## Troubleshooting Git Issues

### Issue: "git pull" fails with merge conflict
**Cause**: Local changes on PythonAnywhere

**Solution**:
```bash
git stash
git pull origin main
git stash pop
```

### Issue: "git push" fails on local machine
**Cause**: Authentication issue or network problem

**Solution**:
```bash
# Check git remote
git remote -v

# If using HTTPS, ensure GitHub credentials are correct
# If using SSH, ensure SSH key is configured
```

### Issue: Files not updating after git pull
**Cause**: Wrong directory or branch

**Solution**:
```bash
# Check current directory
pwd

# Should be: /home/Zihan/medicineList_generatorV1

# Check current branch
git branch

# Should show: * main

# Pull again
git pull origin main
```

---

## Summary

### What We Did:
1. ✅ Updated local git repository with MySQL changes
2. ✅ Pushed changes to GitHub
3. ✅ Pulled updated code on PythonAnywhere
4. ✅ Reinstalled dependencies with `mysqlclient`
5. ✅ Updated `.env` file with MySQL credentials
6. ✅ Ran migrations on MySQL database
7. ✅ Collected static files
8. ✅ Verified MySQL connection

### Next Steps:
1. Reload web app in PythonAnywhere dashboard
2. Test your site at https://Zihan.pythonanywhere.com/
3. Verify all functionality works

---

**Your Medicine List Generator is now fully configured for MySQL on PythonAnywhere free tier!** 🚀
