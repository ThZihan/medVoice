# Git Branch Workflow

## Current Branch Structure

```
master (current) - Main development branch, synced with GitHub
production-v1 - Production codebase backup (on GitHub) (No need to touch it)
main - Original main branch on GitHub (After confirmation, if master branch is ok on real server then sync it with master)
dev - Development branch on GitHub (leave it for now)
```

## Current Status

✅ **Local master branch** has new secure Gemini API implementation
✅ **Pushed to GitHub master branch** - `git push origin master`

## Deployment Workflow

### For PythonAnywhere Deployment

When you clone on PythonAnywhere:

```bash
git clone https://github.com/ThZihan/medicineList_generatorV1.git
```

You will get the **master branch** which contains the new secure implementation with:
- Backend proxy endpoint for Gemini API
- Frontend no longer contains API keys
- Rate limiting enabled
- All security improvements

### Testing Before Production

1. **Test locally** on your development machine:
   - Verify OCR functionality works
   - Check that API key is not exposed in browser DevTools
   - Test all features (login, add medicines, etc.)

2. **When satisfied** with local testing:
   - Push to main branch: `git push origin master:main` (if main exists)
   - Or merge master into main and push

3. **Deploy to PythonAnywhere**:
   - Clone repository (will get master branch with secure code)
   - Follow [`PYTHONANYWHERE_DEPLOYMENT_GUIDE.md`](PYTHONANYWHERE_DEPLOYMENT_GUIDE.md)

## Why This Works

- **master branch** is your active development branch
- **main branch** is for confirmed, production-ready code
- When you clone `medicineList_generatorV1.git`, you get master by default
- The master branch already has all the security improvements

## Important Notes

- **Don't use** `git clone https://github.com/ThZihan/medicineList_generatorV1.git --branch main`
  - This would get old code without the security improvements
  
- **Simply clone** the repository normally to get master branch:
  - `git clone https://github.com/ThZihan/medicineList_generatorV1.git`

- **The .env file** is in `.gitignore` so it won't be committed to GitHub
  - You'll need to create `.env` file on PythonAnywhere with your production API key

## Summary

| Branch | Purpose | Status |
|--------|---------|--------|
| master | Active development | ✅ Has secure code, pushed to GitHub |
| production-v1 | Production backup | On GitHub, don't touch |
| main | Production-ready | Sync from master when confirmed |
| dev | GitHub development | Leave for now |

## Next Steps

1. Test locally to confirm everything works
2. When satisfied, sync master to main (optional)
3. Deploy to PythonAnywhere using master branch
4. Configure Google Cloud Console API key restrictions for production domain
