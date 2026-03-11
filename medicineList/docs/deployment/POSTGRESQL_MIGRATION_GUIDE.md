# PostgreSQL Migration Guide

This guide explains how to migrate the medicine list application from SQLite (development) to PostgreSQL (MedVoice integration).

---

## Overview

The medicine list application supports three database configurations in order of priority:

1. **PostgreSQL** (MedVoice integration - Production)
2. **MySQL** (PythonAnywhere - Legacy production)
3. **SQLite** (Development - Default)

The application automatically selects the appropriate database based on environment variables.

---

## Prerequisites

### 1. PostgreSQL Server Setup

Ensure you have a PostgreSQL server running with the following:

- PostgreSQL 12 or higher
- pgvector extension installed (for MedVoice vector similarity search)
- Database user with appropriate permissions
- Empty database created

### 2. Install PostgreSQL Driver

The PostgreSQL driver is already included in `requirements.txt`:

```bash
pip install psycopg2-binary==2.9.9
```

### 3. Install pgvector (MedVoice Integration)

```bash
pip install pgvector==0.2.4
```

---

## Environment Configuration

### PostgreSQL Environment Variables

Add the following to your `.env` file:

```bash
# PostgreSQL Database Configuration
POSTGRES_DB=medvoice_medicines
POSTGRES_USER=medvoice_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### Connection String Format

The application constructs the connection as:

```
postgresql://POSTGRES_USER:POSTGRES_PASSWORD@POSTGRES_HOST:POSTGRES_PORT/POSTGRES_DB
```

---

## Migration Steps

### Step 1: Backup Existing Data

If you have existing data in SQLite, create a backup:

```bash
# Navigate to backend directory
cd backend

# Create backup
python manage.py dumpdata --output medicines_backup.json

# Backup SQLite database
cp db.sqlite3 db.sqlite3.backup
```

### Step 2: Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE medvoice_medicines;

# Create user
CREATE USER medvoice_user WITH PASSWORD 'your_secure_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE medvoice_medicines TO medvoice_user;

# Exit
\q
```

### Step 3: Enable pgvector Extension (MedVoice)

```bash
# Connect to the database
psql -U medvoice_user -d medvoice_medicines

# Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# Exit
\q
```

### Step 4: Update Environment Variables

Update your `.env` file with PostgreSQL credentials:

```bash
# Comment out MySQL variables (if present)
# DB_NAME=
# DB_USER=
# DB_PASSWORD=
# DB_HOST=
# DB_PORT=

# Add PostgreSQL variables
POSTGRES_DB=medvoice_medicines
POSTGRES_USER=medvoice_user
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### Step 5: Run Migrations

```bash
# Navigate to backend directory
cd backend

# Create migrations (if needed)
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Verify migrations
python manage.py showmigrations
```

### Step 6: Load Data (Optional)

If you have existing data to migrate:

```bash
# Load data from JSON backup
python manage.py loaddata medicines_backup.json

# Or use Django's data migration framework
python manage.py migrate --run-syncdb
```

### Step 7: Create Superuser

```bash
python manage.py createsuperuser
```

---

## Model-Specific Changes

### PostgreSQL-Specific Features

The following PostgreSQL-specific features are available:

#### 1. ArrayField for Timing Schedules

The `UserMedicine` model can use `ArrayField` for timing:

```python
from django.contrib.postgres.fields import ArrayField

class UserMedicine(BaseModel):
    timing = ArrayField(
        models.CharField(max_length=20),
        default=list
    )
```

#### 2. JSONField for Flexible Data

Store additional medicine metadata:

```python
from django.contrib.postgres.fields import JSONField

class UserMedicine(BaseModel):
    metadata = JSONField(default=dict, blank=True, null=True)
```

#### 3. GinIndex for Text Search

Add full-text search capabilities:

```python
from django.contrib.postgres.indexes import GinIndex

class GlobalMedicine(BaseModel):
    class Meta:
        indexes = [
            GinIndex(fields=['medicine_name']),
            GinIndex(fields=['indication']),
        ]
```

#### 4. Vector Similarity Search (MedVoice)

Add vector embeddings for medicine recommendations:

```python
from pgvector.django import VectorField

class GlobalMedicine(BaseModel):
    embedding = VectorField(dimensions=1536)
```

---

## Connection Pooling

PostgreSQL connection pooling is configured in `settings.py`:

```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'CONN_MAX_AGE': 600,  # Persistent connections for 10 minutes
        'OPTIONS': {
            'connect_timeout': 10,
        },
    }
}
```

### Tuning Connection Pool

For high-traffic deployments, consider using `django-db-geventpool` or `pgbouncer`:

```bash
pip install django-db-geventpool
```

---

## Performance Optimization

### 1. Database Indexes

The following indexes are already defined in models:

- `GlobalMedicine.medicine_name` (db_index=True)
- `UserMedicine.medicine_name` (db_index=True)

### 2. Query Optimization

Use `select_related` and `prefetch_related` for related queries:

```python
# Efficient query
medicines = UserMedicine.objects.select_related('patient').all()

# Inefficient query (N+1 problem)
medicines = UserMedicine.objects.all()
for med in medicines:
    print(med.patient.user.username)
```

### 3. Caching

Configure Redis caching for frequently accessed data:

```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
    }
}
```

---

## Testing the Migration

### 1. Verify Database Connection

```bash
python manage.py dbshell
```

You should be connected to PostgreSQL.

### 2. Run Development Server

```bash
python manage.py runserver
```

### 3. Test API Endpoints

```bash
# Test medicines endpoint
curl http://localhost:8000/api/medicine-list/medicines/

# Test OCR endpoint
curl -X POST http://localhost:8000/api/medicine-list/ocr/scan/ \
  -H "Content-Type: application/json" \
  -d '{"image_data": "base64_encoded_image"}'
```

---

## Rollback Procedure

If you need to rollback to SQLite:

### 1. Stop Application

```bash
# Stop Django server
pkill -f "python manage.py runserver"
```

### 2. Backup PostgreSQL Data

```bash
pg_dump -U medvoice_user medvoice_medicines > postgres_backup.sql
```

### 3. Restore SQLite

```bash
# Remove PostgreSQL variables from .env
# POSTGRES_DB=
# POSTGRES_USER=
# POSTGRES_PASSWORD=
# POSTGRES_HOST=
# POSTGRES_PORT=

# Restore SQLite backup
cp db.sqlite3.backup db.sqlite3

# Restart application
python manage.py runserver
```

---

## Troubleshooting

### Issue: "relation does not exist"

**Cause**: Migrations not applied

**Solution**:
```bash
python manage.py migrate
```

### Issue: "could not connect to server"

**Cause**: PostgreSQL not running or wrong credentials

**Solution**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify credentials
psql -U medvoice_user -d medvoice_medicines -h localhost
```

### Issue: "extension 'vector' does not exist"

**Cause**: pgvector not installed

**Solution**:
```bash
# Install pgvector
pip install pgvector==0.2.4

# Enable extension
psql -U medvoice_user -d medvoice_medicines
CREATE EXTENSION vector;
```

### Issue: "connection refused"

**Cause**: Wrong port or host

**Solution**:
```bash
# Check PostgreSQL port
netstat -an | grep 5432

# Verify POSTGRES_PORT in .env
```

---

## Production Deployment

### PythonAnywhere

PythonAnywhere free tier uses MySQL, not PostgreSQL. For PostgreSQL, use:
- Railway
- Render
- Heroku
- DigitalOcean
- AWS RDS

### Environment-Specific Configuration

**Development**:
- Use SQLite (default)
- No environment variables needed
- Fast startup time

**Production (MedVoice)**:
- Use PostgreSQL
- Set POSTGRES_* environment variables
- Configure connection pooling
- Enable pgvector extension

**Production (PythonAnywhere)**:
- Use MySQL
- Set DB_* environment variables
- Configure connection limits

---

## Security Best Practices

### 1. Connection Security

- Use SSL/TLS for production connections
- Restrict database access by IP
- Use strong passwords
- Rotate credentials regularly

### 2. API Key Security

- Store API keys in environment variables
- Never commit `.env` to version control
- Use different keys for dev/prod
- Implement key rotation

### 3. Database Access

- Use least-privilege principle
- Separate read/write users
- Implement connection limits
- Monitor query performance

---

## Monitoring and Maintenance

### 1. Database Monitoring

Monitor:
- Connection count
- Query performance
- Disk usage
- Replication lag (if using replicas)

### 2. Regular Maintenance

```bash
# Vacuum database
VACUUM ANALYZE;

# Reindex
REINDEX DATABASE medvoice_medicines;

# Update statistics
ANALYZE;
```

### 3. Backup Strategy

- Daily automated backups
- Weekly full backups
- Off-site backup storage
- Test restore procedures

---

## Summary

This migration guide provides:

✅ PostgreSQL setup instructions
✅ Environment variable configuration
✅ Migration steps from SQLite
✅ Model-specific PostgreSQL features
✅ Performance optimization tips
✅ Troubleshooting common issues
✅ Production deployment guidelines
✅ Security best practices
✅ Monitoring and maintenance procedures

For additional support, refer to:
- [Django PostgreSQL Documentation](https://docs.djangoproject.com/en/5.0/ref/databases/#postgresql-notes)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [MedVoice Integration Guide](../architecture/MEDVOICE_INTEGRATION.md)

---

*Last Updated: 2026-03-11*
