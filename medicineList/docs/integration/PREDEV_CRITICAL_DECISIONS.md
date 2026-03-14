# Pre-Development Critical Decisions

This document records two critical decisions that must be made at the START of MedVoice development, before any migrations are run.

---

## Item 1 — AUTH_USER_MODEL Configuration

### Current State

The `medicines/models.py` correctly references `settings.AUTH_USER_MODEL` in both `Patient` and `UserColorPreferences` models:

```python
# medicineList/backend/medicines/models.py
class Patient(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)

class UserColorPreferences(BaseModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
```

However, the setting itself does not yet exist in `settings.py` because the MedVoice custom User model has not been built yet.

### Critical Requirement

**This setting MUST be the very first thing added to MedVoice's `settings.py` after the custom User model app is created. It must be set before running any migrations.**

If migrations are run before this is set:
- Django will create a second user table using its default `auth.User` model
- The medicines app will reference the wrong user model
- This causes foreign key failures and data isolation problems
- Fixing this requires complex database migrations and potential data loss

### Exact Line to Add

```python
# medlist_backend/settings.py
AUTH_USER_MODEL = 'accounts.User'  # Replace 'accounts' with whatever app name MedVoice uses for auth
```

### Pre-Migration Checklist

- [ ] Custom User model created in MedVoice
- [ ] AUTH_USER_MODEL added to settings.py
- [ ] Zero migrations have been run yet
- [ ] Only then: run `python manage.py makemigrations`

---

## Item 2 — z.ai API Endpoint Verification

### Current State

The `glm_service.py` currently defaults to `https://open.bigmodel.cn/api/paas/v4/chat/completions` which is Zhipu AI's direct endpoint. z.ai uses a different base URL.

### Verified z.ai Configuration

Based on the official z.ai documentation (https://docs.z.ai):

- **Correct Base URL**: `https://api.z.ai/api/paas/v4/chat/completions`
- **Available Models**:
  - GLM-4.7 series: `glm-4.7`, `glm-4.7-flash`, `glm-4.7-flashx`
  - GLM-4.5 series: `glm-4.5`, `glm-4.5-air`

### Critical Requirement

> **WARNING**: Before writing any code that calls GLM-4, log into the z.ai dashboard, find the API documentation section, and confirm the correct base URL and available model names. Set the confirmed values as environment variables.

### Required Environment Variables

Add these to `.env` with confirmed values:

```bash
# z.ai API Configuration
GLM_API_URL=https://api.z.ai/api/paas/v4/chat/completions
GLM_MODEL_PRIMARY=glm-4.7-flash
GLM_MODEL_FALLBACK=glm-4.5-flash
```

### Update .env.example

Add these placeholder values to `.env.example` with a comment:

```bash
# z.ai API Configuration
# Verify from z.ai dashboard before use: https://docs.z.ai
GLM_API_URL=https://api.z.ai/api/paas/v4/chat/completions
GLM_MODEL_PRIMARY=glm-4.7-flash
GLM_MODEL_FALLBACK=glm-4.5-flash
```

### Code Updates Required

Update `medlist_backend/settings.py` to use the correct default:

```python
# GLM API URL (default: z.ai endpoint, NOT Zhipu AI)
GLM_API_URL = config('GLM_API_URL', default='https://api.z.ai/api/paas/v4/chat/completions')
```

Update `ai_services/glm_service.py` MODELS_TO_TRY:

```python
# Model fallback order (primary → secondary → fallback)
MODELS_TO_TRY = [
    'glm-4.7-flash',  # Primary: Latest flash model
    'glm-4.5-flash',  # Secondary: Previous flash model
]
```
