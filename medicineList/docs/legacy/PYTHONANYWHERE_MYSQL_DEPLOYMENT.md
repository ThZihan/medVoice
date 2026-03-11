# PythonAnywhere MySQL Deployment Guide (Free Tier)

**Important**: PythonAnywhere free tier only supports MySQL, not PostgreSQL. This guide is specifically configured for MySQL deployment.

## Updated Files for MySQL Support

### 1. requirements.txt - Updated
```txt
Django==5.0.1
djangorestframework==3.14.0
mysqlclient==2.2.0  # Changed from psycopg2-binary
python-decouple==3.8
```

### 2. settings.py - Updated Database Configuration
```python
# MySQL configuration for PythonAnywhere free tier
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}
```

### 3. .env.production - Updated for MySQL
```env
DEBUG=False
ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# MySQL Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_HOST=your_database_host.mysql.pythonanywhere-services.com
DB_PORT=3306
```

---

## Deployment Steps for MySQL

### Step 1: Create MySQL Database on PythonAnywhere

1. Go to the **Databases** tab in PythonAnywhere
2. Click **"Create a database"**
3. Choose a name (e.g., `medlist_db`)
4. Click **"Create database"**
5. **Note down these values:**
   - Database name (e.g., `Zihan$medlist_db`)
   - Database username (e.g., `Zihan`)
   - Database password (auto-generated)
   - Database host (e.g., `Zihan.mysql.pythonanywhere-services.com`)

**Important**: The host will end with `.mysql.pythonanywhere-services.com` (not postgresql)

### Step 2: Update Your .env File

In your bash console:
```bash
cd ~/medicineList_generatorV1/backend
nano .env
```

Update the database section with your actual MySQL credentials:
```env
DEBUG=False
ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com
SECRET_KEY=*3!-5b1m9x%5urn!r+x*j51$qn@e7!3t29#@gz=7-o20iejm-4
GEMINI_API_KEY=your_gemini_api_key_here
DB_NAME=Zihan$medlist_db
DB_USER=Zihan
DB_PASSWORD=your_actual_mysql_password
DB_HOST=Zihan.mysql.pythonanywhere-services.com
DB_PORT=3306
```

**Save:** `Ctrl+O`, `Enter`, then `Ctrl+X`

### Step 3: Install MySQL Client Library

Since we updated requirements.txt to use `mysqlclient` instead of `psycopg2-binary`, you need to reinstall dependencies:

```bash
cd ~/medicineList_generatorV1/backend
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected output:**
```
Collecting mysqlclient==2.2.0
  Downloading mysqlclient-2.2.0-cp311-cp311-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (1.3 MB)
Installing collected packages: mysqlclient
Successfully installed mysqlclient-2.2.0
```

### Step 4: Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

**Expected output:**
```
Operations to perform:
  Apply all migrations: admin, auth, contenttypes, medicines, sessions
Running migrations:
  Applying contenttypes.0001_initial... OK
  Applying auth.0001_initial... OK
  ...
```

### Step 5: Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### Step 6: Verify MySQL Connection

```bash
python manage.py shell
>>> from django.db import connection
>>> connection.vendor
'mysql'
>>> exit()
```

**Expected output**: `mysql` (not `postgresql` or `sqlite3`)

---

## MySQL vs PostgreSQL Differences

| Feature | PostgreSQL | MySQL (Free Tier) |
|---------|------------|-------------------|
| PythonAnywhere Support | Paid tiers only | Free tier available |
| Port | 5432 | 3306 |
| Host | `.postgresql.pythonanywhere-services.com` | `.mysql.pythonanywhere-services.com` |
| Python Library | `psycopg2-binary` | `mysqlclient` |
| Django Engine | `django.db.backends.postgresql` | `django.db.backends.mysql` |

---

## Troubleshooting MySQL Issues

### Issue: Can't connect to MySQL server
**Cause**: Wrong database credentials or host

**Solution**:
1. Verify database credentials in PythonAnywhere Databases tab
2. Check that DB_HOST ends with `.mysql.pythonanywhere-services.com`
3. Ensure DB_PORT is `3306` (not 5432)
4. Verify DB_NAME includes your username prefix (e.g., `Zihan$medlist_db`)

### Issue: mysqlclient installation fails
**Cause**: Missing system dependencies

**Solution**:
```bash
pip install --upgrade pip
pip install mysqlclient --no-cache-dir
```

If that fails, try:
```bash
pip install mysqlclient-binary
```

### Issue: "Access denied for user"
**Cause**: Incorrect password or username

**Solution**:
1. Go to Databases tab in PythonAnywhere
2. Click "Change password" for your database
3. Update .env file with new password
4. Reload web app

### Issue: Unknown database
**Cause**: Database not created or wrong name

**Solution**:
1. Go to Databases tab
2. Verify database exists
3. Copy exact database name (includes username prefix)
4. Update DB_NAME in .env file

### Issue: MySQL connection timeout
**Cause**: Connection pool issues

**Solution**: Add this to settings.py DATABASES configuration:
```python
'OPTIONS': {
    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    'connect_timeout': 30,
    'read_timeout': 30,
    'write_timeout': 30,
}
```

---

## MySQL-Specific Configuration

### Character Set and Collation

MySQL requires proper character set configuration. Add this to your settings.py if you encounter encoding issues:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': config('DB_NAME'),
        'USER': config('DB_USER'),
        'PASSWORD': config('DB_PASSWORD'),
        'HOST': config('DB_HOST'),
        'PORT': config('DB_PORT', default='3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}
```

### Connection Pooling (Optional)

For better performance, you can add connection pooling:

```python
'OPTIONS': {
    'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
    'pool_size': 5,
    'max_overflow': 10,
}
```

---

## Complete .env File Example for MySQL

```env
# Django Configuration
DEBUG=False
ALLOWED_HOSTS=Zihan.pythonanywhere.com,zihan.pythonanywhere.com
SECRET_KEY=*3!-5b1m9x%5urn!r+x*j51$qn@e7!3t29#@gz=7-o20iejm-4

# Google Gemini API Configuration
GEMINI_API_KEY=AIzaSyBIfSBE9WqgAEX3gX4Hp-0_tnKtqFo_R3A

# MySQL Database Configuration (PythonAnywhere Free Tier)
DB_NAME=Zihan$medlist_db
DB_USER=Zihan
DB_PASSWORD=your_actual_mysql_password_here
DB_HOST=Zihan.mysql.pythonanywhere-services.com
DB_PORT=3306
```

---

## Verification Steps

After completing deployment, verify MySQL is working:

### 1. Check Database Type
```bash
python manage.py shell
>>> from django.db import connection
>>> connection.vendor
'mysql'
```

### 2. Test Database Connection
```bash
python manage.py dbshell
```

You should see a MySQL prompt:
```
Welcome to the MySQL monitor...
mysql>
```

Type `exit` to leave the shell.

### 3. Check Tables
```bash
python manage.py dbshell
mysql> SHOW TABLES;
```

You should see Django tables like `auth_user`, `medicines_patient`, etc.

### 4. Test Application
- Visit https://Zihan.pythonanywhere.com/
- Try registering a new user
- Try logging in
- Add a medicine
- Verify data persists in MySQL database

---

## Performance Tips for MySQL

1. **Use indexes**: Add indexes to frequently queried fields in models.py
2. **Optimize queries**: Use `select_related()` and `prefetch_related()` for related objects
3. **Connection pooling**: Implement connection pooling for better performance
4. **Query caching**: Consider using Django's cache framework
5. **Monitor slow queries**: Check PythonAnywhere's database dashboard for slow queries

---

## Backup Strategy

MySQL databases on PythonAnywhere are backed up automatically, but you should also:

1. **Regular dumps**:
```bash
python manage.py dbshell
mysqldump -u Zihan -p Zihan$medlist_db > backup.sql
```

2. **Django management command**:
```bash
python manage.py dumpdata > backup.json
```

3. **Restore from backup**:
```bash
python manage.py loaddata backup.json
```

---

## Next Steps

After MySQL configuration is complete:

1. **Configure WSGI file** in PythonAnywhere dashboard
2. **Set virtualenv path** to: `/home/Zihan/medicineList_generatorV1/backend/venv`
3. **Configure static files** path
4. **Reload web app**
5. **Test your deployment** at https://Zihan.pythonanywhere.com/

---

**Summary**: Your project is now configured for MySQL deployment on PythonAnywhere free tier. All database-related files have been updated from PostgreSQL to MySQL configuration.

**Files Updated**:
- ✅ [`requirements.txt`](backend/requirements.txt) - Changed to `mysqlclient==2.2.0`
- ✅ [`settings.py`](backend/medlist_backend/settings.py) - MySQL database configuration
- ✅ [`.env.production`](backend/.env.production) - MySQL credentials template
- ✅ [`.env.example`](backend/.env.example) - MySQL configuration example

**Ready for deployment!** 🚀
