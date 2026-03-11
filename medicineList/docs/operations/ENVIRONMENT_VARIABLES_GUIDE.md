# Environment Variables Setup Guide

## Overview

This guide explains how to set up environment variables for the Medicine List Generator application, specifically for securing the Gemini API key.

## Local Development Setup

### Step 1: Create `.env` file

In the `backend/` directory, create a file named `.env` (note the dot prefix - this makes it hidden):

```bash
cd backend
touch .env
```

### Step 2: Add your API key

Open the `.env` file and add your Gemini API key:

```env
GEMINI_API_KEY=your-actual-api-key-here
```

**Important:** Never commit the `.env` file to version control! It should already be in `.gitignore`.

### Step 3: Verify setup

Run the Django server:

```bash
python manage.py runserver
```

The server will automatically load the API key from the `.env` file using the `python-decouple` library.

## Production Deployment

### PythonAnywhere

1. Go to your PythonAnywhere dashboard
2. Navigate to your Web app
3. Scroll down to the "Variables" section
4. Add a new variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your production API key
5. Click "Add variable"
6. Reload your web app

### Render

1. Go to your Render dashboard
2. Select your service
3. Click "Environment" tab
4. Click "Add Environment Variable"
5. Enter:
   - Key: `GEMINI_API_KEY`
   - Value: Your production API key
6. Click "Save"
7. Deploy your service

### Railway

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Set the variable:
   ```bash
   railway variables set GEMINI_API_KEY=your-actual-api-key-here
   ```
4. Redeploy your service

### Fly.io

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `flyctl auth login`
3. Set the secret:
   ```bash
   flyctl secrets set GEMINI_API_KEY=your-actual-api-key-here
   ```
4. Redeploy: `flyctl deploy`

### Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - Key: `GEMINI_API_KEY`
   - Value: Your production API key
4. Click "Save"
5. Redeploy your project

### Heroku

1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Set the config var:
   ```bash
   heroku config:set GEMINI_API_KEY=your-actual-api-key-here
   ```
4. Deploy: `git push heroku main`

## Google Cloud Console Configuration

### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (you'll need it for the next steps)

### Step 2: Set Application Restrictions

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Find your API key
3. Click "Edit API key"
4. Under "Application restrictions", choose one:

**For Development:**
- Select "HTTP referrers"
- Add: `http://127.0.0.1:*`, `http://localhost:*`

**For Production:**
- Select "IP addresses"
- Add your server's IP address

### Step 3: Set API Restrictions

1. Under "API restrictions", select "Restrict key"
2. Choose only "Generative Language API"
3. This prevents the key from being used for other Google services

### Step 4: Enable Billing Alerts

1. Go to [Billing](https://console.cloud.google.com/billing)
2. Click "Budgets & alerts"
3. Set up alerts for unusual spending

## Security Best Practices

### 1. Use Different Keys for Dev and Prod

Never use the same API key for development and production:

```env
# Development (.env.local)
GEMINI_API_KEY=dev-key-xxx

# Production (deployment platform)
GEMINI_API_KEY=prod-key-yyy
```

### 2. Rotate Keys Regularly

- Create a new API key every 3-6 months
- Update your environment variables
- Delete the old key from Google Cloud Console

### 3. Monitor Usage

- Check Google Cloud Console for API usage
- Set up alerts for unusual activity
- Review logs regularly

### 4. Never Commit `.env` Files

Ensure your `.gitignore` includes:

```gitignore
.env
.env.local
.env.*.local
```

### 5. Use Strong Secrets Management

For production, consider using:
- AWS Secrets Manager
- Azure Key Vault
- Google Secret Manager
- HashiCorp Vault

## Troubleshooting

### Error: "API key not configured on server"

**Cause:** `GEMINI_API_KEY` is not set in environment variables.

**Solution:** Add the API key to your environment variables following the platform-specific instructions above.

### Error: "API access denied" (403)

**Cause:** API key restrictions are blocking the request.

**Solution:** Check Google Cloud Console:
- Verify application restrictions match your deployment
- Verify "Generative Language API" is enabled
- Check if key has been revoked

### Error: "Rate limit exceeded" (429)

**Cause:** Too many requests in a short time.

**Solution:** 
- This is expected behavior - rate limiting is working
- Wait before trying again
- Consider increasing rate limits if needed

## Testing

### Test Locally

1. Ensure `.env` file exists in `backend/` directory
2. Run: `python manage.py runserver`
3. Upload a prescription image
4. Check browser console for errors
5. Check backend logs for API calls

### Test Production

1. Verify environment variable is set on deployment platform
2. Redeploy the application
3. Test OCR functionality
4. Monitor logs for any errors

## Additional Resources

- [Google Cloud API Key Best Practices](https://docs.cloud.google.com/docs/authentication/api-keys-best-practices)
- [Django Environment Variables](https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/#environment-variables)
- [Python-Decouple Documentation](https://pypi.org/project/python-decouple/)
