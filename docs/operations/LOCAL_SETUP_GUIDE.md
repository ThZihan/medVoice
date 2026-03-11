# Local Development Setup Guide

## Why the project wasn't running locally

Your project had several configuration issues preventing it from running locally:

1. **Environment variables not loaded**: [`settings.py`](backend/medlist_backend/settings.py:1) had hardcoded values instead of reading from [`.env`](backend/.env:1)
2. **Wrong ALLOWED_HOSTS**: Set to PythonAnywhere hosts instead of `127.0.0.1,localhost`
3. **DEBUG = False**: Would cause errors during local development
4. **Missing requirements.txt**: No way to install Python dependencies
5. **Incorrect static files config**: [`urls.py`](backend/medlist_backend/urls.py:46) had wrong document_root path

## Fixed Issues

✅ Created [`requirements.txt`](backend/requirements.txt:1) with all dependencies
✅ Updated [`settings.py`](backend/medlist_backend/settings.py:1) to load environment variables using `python-decouple`
✅ Fixed static files serving in [`urls.py`](backend/medlist_backend/urls.py:46)
✅ Your [`.env`](backend/.env:1) file already has correct local settings

## Quick Start (Windows)

### 1. Install Python Dependencies

```cmd
cd backend
pip install -r requirements.txt
```

### 2. Run Database Migrations

```cmd
python manage.py makemigrations
python manage.py migrate
```

### 3. Create a Superuser (Optional - for admin access)

```cmd
python manage.py createsuperuser
```

### 4. Run the Development Server

```cmd
python manage.py runserver
```

The server will start at: **http://127.0.0.1:8000**

### 5. Access the Application

- **Main app**: http://127.0.0.1:8000/
- **Admin panel**: http://127.0.0.1:8000/admin/
- **Login page**: http://127.0.0.1:8000/login/

## Project Structure

```
medicineList_generator/
├── backend/                    # Django backend
│   ├── manage.py              # Django management script
│   ├── .env                   # Environment variables (local)
│   ├── .env.example           # Environment variables template
│   ├── requirements.txt       # Python dependencies
│   ├── db.sqlite3            # SQLite database (auto-created)
│   ├── medlist_backend/      # Django project settings
│   │   ├── settings.py       # Main settings (now reads from .env)
│   │   └── urls.py           # URL routing
│   └── medicines/            # Main Django app
│       ├── models.py         # Database models
│       ├── views.py          # API views
│       └── admin.py          # Admin configuration
│
└── medicineList_generator/    # Frontend files
    ├── index.html            # Main dashboard
    ├── login.html            # Login page
    ├── styles.css            # Stylesheets
    ├── auth.js               # Authentication logic
    ├── medicines.js          # Medicine management
    ├── ocr.js                # OCR functionality
    └── config.js             # API configuration
```

## Environment Variables

Your [`.env`](backend/.env:1) file contains:

```env
SECRET_KEY=django-insecure-_i&)8sr67wel843k*$^*yq)1$q%bf-e#qg0g53m2jnwaa--wts
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
GEMINI_API_KEY=AIzaSyBIfSBE9WqgAEX3gX4Hp-0_tnKtqFo_R3A
```

**⚠️ Security Note**: Never commit `.env` to version control. Use `.env.example` as a template.

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'decouple'"

**Solution**: Install dependencies:
```cmd
pip install -r requirements.txt
```

### Issue: "DisallowedHost at /" error

**Solution**: Ensure your [`.env`](backend/.env:4) file has:
```env
ALLOWED_HOSTS=127.0.0.1,localhost
```

### Issue: Static files not loading (404 errors)

**Solution**: Ensure `DEBUG=True` in [`.env`](backend/.env:3). Static files are only served automatically in DEBUG mode.

### Issue: Database "no such table" errors

**Solution**: Run migrations:
```cmd
python manage.py makemigrations
python manage.py migrate
```

### Issue: Port 8000 already in use

**Solution**: Use a different port:
```cmd
python manage.py runserver 8080
```

Then access at: http://127.0.0.1:8080/

## Development Workflow

1. **Make code changes** in [`backend/medicines/views.py`](backend/medicines/views.py:1), [`models.py`](backend/medicines/models.py:1), or frontend files
2. **Restart the server** (Ctrl+C, then `python manage.py runserver`)
3. **Test changes** in browser at http://127.0.0.1:8000/
4. **Check console** for errors (browser DevTools F12)

## Testing the Application

### Test User Creation

Run the provided script to create a test user:
```cmd
python create_test_user.py
```

This creates a user with:
- Username: `testuser`
- Password: `testpass123`

### Manual Registration

1. Go to http://127.0.0.1:8000/login/
2. Click "Register" button
3. Fill in the registration form
4. Submit and login with new credentials

## Production Deployment Notes

When deploying to production (PythonAnywhere, Render, Fly.io, etc.):

1. Set `DEBUG=False` in environment variables
2. Update `ALLOWED_HOSTS` to your production domain
3. Use PostgreSQL instead of SQLite
4. Collect static files: `python manage.py collectstatic`
5. Use a production WSGI server (Gunicorn)
6. Set up proper `SECRET_KEY` (generate with `python manage.py generate_secret_key`)

## API Endpoints

The application exposes these API endpoints:

- `POST /api/login/` - User login
- `POST /api/logout/` - User logout
- `POST /api/register/` - User registration
- `GET /api/medicines/` - Get user's medicines
- `POST /api/medicines/add/` - Add new medicine
- `DELETE /api/medicines/<id>/delete/` - Delete medicine
- `GET /api/patient/profile/` - Get patient profile
- `PUT /api/patient/profile/update/` - Update patient profile

## Next Steps

- [ ] Install dependencies
- [ ] Run migrations
- [ ] Start development server
- [ ] Test login/registration
- [ ] Test medicine CRUD operations
- [ ] Test OCR functionality
- [ ] Review code and make improvements

## Need Help?

If you encounter issues:

1. Check the terminal output for error messages
2. Ensure all dependencies are installed
3. Verify [`.env`](backend/.env:1) file exists and has correct values
4. Check browser console (F12) for frontend errors
5. Review Django debug pages for detailed error information
