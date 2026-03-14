# GLM Multi-Model Fallback Feature

## Overview

The GLM service now supports automatic multi-model fallback to improve reliability and availability. When the primary model is busy or unavailable, the service automatically falls back to secondary models.

## Model Fallback Order

By default, the GLM service tries models in this order:

1. **glm-4.7-flash** (Primary) - Latest flash model for fast, efficient responses
2. **glm-4.5-flash** (Secondary) - Previous flash model for fallback when primary is busy

## How It Works

### Automatic Fallback

When you call any GLM service method without specifying a model, the service automatically:

1. Tries `glm-4.7-flash` first
2. If it fails with timeout, rate limit (429), or server error (5xx), tries `glm-4.5-flash`
3. Returns the result from the first successful model
4. Includes `model_used` in the response so you know which model was used

### Example Usage

```python
from ai_services.glm_service import GLMAPIService

# Initialize service (no model specified = automatic fallback)
service = GLMAPIService()

# Generate review - will try glm-4.7-flash first, then glm-4.5-flash
result = service.generate_review_from_qa(
    answers=[
        {'question': 'What brings you here today?', 'answer': 'I have a headache'}
    ],
    review_type='clinical'
)

if result['success']:
    print(f"Review generated using model: {result['model_used']}")
    print(result['review'])
else:
    print(f"Error: {result['error']}")
```

### Manual Model Selection

If you want to use a specific model only (disable fallback):

```python
# Option 1: Pass model parameter directly
result = service.generate_review_from_qa(
    answers=answers,
    model='glm-4.7-flash'  # Will only try this model
)

# Option 2: Set GLM_MODEL in .env file
# GLM_MODEL=glm-4.7-flash
# This disables automatic fallback for all calls
```

## Response Format

All GLM service methods now include a `model_used` field in successful responses:

```python
{
    'success': True,
    'review': { ... },  # or 'moderation' or 'structured_review'
    'model_used': 'glm-4.7-flash'  # or 'glm-4.5-flash'
}
```

## Error Handling

The service handles these errors automatically with fallback:

- **Timeout** (30 seconds) - Tries next model
- **Rate Limit** (HTTP 429) - Tries next model
- **Server Errors** (HTTP 500, 502, 503, 504) - Tries next model
- **Other Errors** - Raises GLMAPIError immediately (no fallback)

If all models fail, the service raises a `GLMAPIError` with details about the last error.

## Configuration

### Environment Variables

```bash
# .env file

# GLM API Key (required)
GLM_API_KEY=your-glm-api-key-here

# Optional: Override automatic fallback
# GLM_MODEL=glm-4.7-flash
```

### Settings Configuration

```python
# medlist_backend/settings.py

# GLM model for content generation
# Multi-model fallback is enabled by default (tries: glm-4.7-flash → glm-4.5-flash)
# Set GLM_MODEL in .env to override and use a specific model only
GLM_MODEL = config('GLM_MODEL', default=None)
```

## Benefits

1. **Improved Reliability** - Automatic fallback ensures your app continues working even when one model is busy
2. **Better Performance** - Primary flash model provides fast responses when available
3. **Graceful Degradation** - Falls back to older models instead of failing completely
4. **Transparency** - `model_used` field lets you track which model handled each request
5. **Easy Configuration** - Works out of the box, no changes needed to existing code

## Available Models

- **glm-4.7-flash** - Latest flash model (recommended for production)
- **glm-4.5-flash** - Previous flash model (good fallback)
- **glm-4** - Standard model (slower but more capable)
- **glm-4-plus** - Enhanced capabilities model
- **glm-4-air** - Lightweight model for simple tasks

## Monitoring

Check your logs to see which models are being used:

```
INFO - Attempting GLM API call with model: glm-4.7-flash
INFO - Successfully called GLM API with model: glm-4.7-flash
INFO - Successfully generated review from 5 Q&A answers using model: glm-4.7-flash
```

Or when fallback occurs:

```
INFO - Attempting GLM API call with model: glm-4.7-flash
WARNING - API request failed with status 429 for model glm-4.7-flash, trying next model...
INFO - Attempting GLM API call with model: glm-4.5-flash
INFO - Successfully called GLM API with model: glm-4.5-flash
INFO - Successfully generated review from 5 Q&A answers using model: glm-4.5-flash
```

## Migration Guide

### Existing Code

If you have existing code using GLM service, **no changes are required**. The service will automatically use multi-model fallback.

```python
# This code continues to work exactly as before
# But now with automatic fallback support
service = GLMAPIService()
result = service.generate_review_from_qa(answers)
```

### New Code

For new code, you can take advantage of the `model_used` field:

```python
service = GLMAPIService()
result = service.generate_review_from_qa(answers)

if result['success']:
    model = result['model_used']
    if model == 'glm-4.5-flash':
        # Log that fallback occurred
        logger.warning(f'GLM fallback activated, using {model}')
    
    # Process result normally
    process_review(result['review'])
```

## Troubleshooting

### All Models Failing

If you see "All GLM API calls failed" errors:

1. Check your API key is valid: `GLM_API_KEY` in `.env`
2. Verify API endpoint is correct: `GLM_API_URL` in settings
3. Check network connectivity to GLM API
4. Review error logs for specific failure reasons

### Always Using Fallback Model

If you notice the service always uses `glm-4.5-flash`:

1. Check if `glm-4.7-flash` is available in your region
2. Review rate limits on your GLM API account
3. Check logs for specific error messages when trying primary model

### Want to Disable Fallback

To use a specific model only:

```python
# In .env
GLM_MODEL=glm-4.7-flash

# Or in code
result = service.generate_review_from_qa(answers, model='glm-4.7-flash')
```

## Future Enhancements

Potential future improvements:

- Add more models to fallback chain (glm-4, glm-4-plus)
- Implement circuit breaker pattern for repeated failures
- Add metrics/monitoring for model usage statistics
- Support custom fallback chains per operation type
