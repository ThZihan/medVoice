# PostgreSQL Driver Production Guide

## Overview

This document explains the PostgreSQL driver configuration for development and production environments, and why `psycopg2-binary` should be replaced with `psycopg2` in production.

## Development vs Production

### Development (psycopg2-binary)

For local development, `psycopg2-binary` is perfectly fine and recommended:

```python
# requirements.txt
psycopg2-binary==2.9.9  # Development only
```

**Advantages:**
- Pre-compiled binary packages - no build tools required
- Fast installation with pip
- Works out of the box on most systems

### Production (psycopg2)

For production deployments, use `psycopg2` instead:

```python
# requirements.txt
psycopg2==2.9.9  # Production
```

**Why use psycopg2 in production:**

1. **SSL/TLS Support**
   - `psycopg2-binary` may have limited SSL support
   - Production databases require secure connections
   - `psycopg2` is compiled with full OpenSSL support

2. **Performance**
   - `psycopg2` is compiled for your specific system architecture
   - Better optimization and performance
   - Reduced memory footprint

3. **Security**
   - Binary packages may use older OpenSSL versions
   - Compiled version uses system's OpenSSL with security patches
   - Better compliance with security standards

4. **Stability**
   - Fewer runtime issues in production
   - Better error handling
   - More reliable under load

## Installation

### Development Installation

```bash
pip install psycopg2-binary
```

### Production Installation

On Linux (Ubuntu/Debian):

```bash
# Install build dependencies
sudo apt-get update
sudo apt-get install -y libpq-dev python3-dev gcc

# Install psycopg2
pip install psycopg2
```

On macOS:

```bash
# Install PostgreSQL client library
brew install postgresql

# Install psycopg2
pip install psycopg2
```

On Windows:

```bash
# Install PostgreSQL from https://www.postgresql.org/download/windows/
# The installer includes the required client libraries

# Install psycopg2
pip install psycopg2
```

## Deployment Checklist

### PythonAnywhere

For PythonAnywhere deployments:

1. **Use psycopg2-binary** (PythonAnywhere has it pre-configured)
   - The platform handles SSL and performance optimizations
   - Binary packages work well in their environment

```python
# requirements.txt for PythonAnywhere
psycopg2-binary==2.9.9
```

### VPS/Dedicated Server

For VPS or dedicated servers:

1. **Use psycopg2** (compile from source)

```bash
# Install dependencies
sudo apt-get install -y libpq-dev python3-dev gcc

# Install psycopg2
pip install psycopg2
```

### Docker

For Docker deployments:

```dockerfile
# Dockerfile
FROM python:3.11-slim

# Install build dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install psycopg2
RUN pip install psycopg2==2.9.9

# Copy requirements and install other dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt
```

## Current Project Configuration

### Current State

The project currently uses `psycopg2-binary` in requirements.txt:

```python
# requirements.txt
psycopg2-binary==2.9.9  # PostgreSQL driver (production)
```

### Recommended Changes

Update the comment to clarify usage:

```python
# requirements.txt
# PostgreSQL driver
# Development: psycopg2-binary (fast install, no build tools needed)
# Production: psycopg2 (better SSL, performance, security)
psycopg2-binary==2.9.9  # OK for PythonAnywhere, use psycopg2 for VPS/production
```

### For VPS/Production Deployment

When deploying to a VPS or production server:

1. Update requirements.txt:
```python
psycopg2==2.9.9  # Production driver with full SSL support
```

2. Install build dependencies:
```bash
sudo apt-get install -y libpq-dev python3-dev gcc
```

3. Reinstall dependencies:
```bash
pip install -r requirements.txt
```

## Troubleshooting

### Installation Errors

**Error:** `pg_config executable not found`

**Solution:** Install PostgreSQL development libraries:
```bash
sudo apt-get install -y libpq-dev
```

**Error:** `error: Python.h: No such file or directory`

**Solution:** Install Python development headers:
```bash
sudo apt-get install -y python3-dev
```

### SSL Errors in Production

**Error:** `connection is insecure` or SSL warnings

**Solution:** Ensure you're using `psycopg2` and configure SSL:

```python
# settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('POSTGRES_DB'),
        'USER': config('POSTGRES_USER'),
        'PASSWORD': config('POSTGRES_PASSWORD'),
        'HOST': config('POSTGRES_HOST'),
        'PORT': config('POSTGRES_PORT', default='5432'),
        'OPTIONS': {
            'sslmode': 'require',  # Force SSL connection
        },
    }
}
```

### Performance Issues

If experiencing slow database connections:

1. Verify you're using `psycopg2` not `psycopg2-binary`
2. Enable connection pooling:
```python
DATABASES['default']['CONN_MAX_AGE'] = 600  # 10 minutes
```

3. Use connection pooling (pgbouncer) for high-traffic sites

## Summary

| Environment | Driver | Notes |
|-------------|--------|-------|
| Local Development | psycopg2-binary | Fast install, no build tools |
| PythonAnywhere | psycopg2-binary | Platform optimized |
| VPS/Production | psycopg2 | Better SSL, performance, security |
| Docker | psycopg2 | Compile in Dockerfile |

## References

- [psycopg2 Documentation](https://www.psycopg.org/docs/)
- [Django PostgreSQL Notes](https://docs.djangoproject.com/en/5.0/ref/databases/#postgresql-notes)
- [PostgreSQL SSL Configuration](https://www.postgresql.org/docs/current/libpq-ssl.html)
