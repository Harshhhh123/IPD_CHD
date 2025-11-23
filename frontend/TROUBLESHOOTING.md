# Troubleshooting API Key Issues

## Common Issues and Fixes

### Issue 1: API Key Not Being Read

**Symptoms:**
- Console shows "API key not found"
- App falls back to OCR only

**Fixes:**

1. **Check .env file location:**
   - Must be in project root (same folder as `package.json`)
   - NOT in `src/` folder
   - File name must be exactly `.env` (not `.env.txt` or `env`)

2. **Check .env file format:**
   ```
   ✅ CORRECT:
   VITE_GEMINI_API_KEY=AIzaSyDDwCk5dJTLyKtYN65v9DHdGTz_eHU9S_o
   
   ❌ WRONG (has extra dots):
   VITE_GEMINI_API_KEY=AIzaSyDDwCk5dJTLyKtYN65v9DHdGTz_eHU9S_o..
   
   ❌ WRONG (has spaces):
   VITE_GEMINI_API_KEY = AIzaSy...
   
   ❌ WRONG (quotes not needed):
   VITE_GEMINI_API_KEY="AIzaSy..."
   ```

3. **Restart Dev Server:**
   - Stop server (Ctrl+C)
   - Run `npm run dev` again
   - Environment variables only load when server starts

4. **Check for hidden characters:**
   - Open `.env` in a text editor (not Word)
   - Make sure no extra spaces or characters
   - Key should be ~39 characters long

### Issue 2: API Key Has Extra Characters

**Your key shows:** `AIzaSyDDwCk5dJTLyKtYN65v9DHdGTz_eHU9S_o..`

**Problem:** The `..` at the end is likely a typo or copy-paste error.

**Fix:**
1. Open `.env` file
2. Remove the `..` at the end
3. Should be: `VITE_GEMINI_API_KEY=AIzaSyDDwCk5dJTLyKtYN65v9DHdGTz_eHU9S_o`
4. Save and restart dev server

### Issue 3: Check if Key is Loading

**Debug Steps:**

1. Open browser console (F12)
2. Navigate to Screen 3
3. Look for "=== Environment Variable Debug ==="
4. Check the output:
   - Should show API key exists: `true`
   - Should show length: ~39 characters
   - Should start with: `AIzaSy`

### Issue 4: API Key Invalid or Expired

**Symptoms:**
- Key is detected but API calls fail
- Error: "API key not valid" or "Permission denied"

**Fixes:**

1. **Verify key is correct:**
   - Go to https://aistudio.google.com/app/apikey
   - Check if key matches
   - Create new key if needed

2. **Check API restrictions:**
   - In Google Cloud Console
   - Make sure no IP/HTTP restrictions
   - For development, allow all

3. **Regenerate key:**
   - Delete old key
   - Create new one
   - Update `.env` file

### Quick Test

Run this in browser console on Screen 3:
```javascript
console.log('API Key:', import.meta.env.VITE_GEMINI_API_KEY);
```

**Expected:** Should show your API key (starts with AIzaSy)
**If undefined:** Key not loading - check .env file location and format

## Still Not Working?

1. **Verify .env file exists:**
   ```bash
   # In project root, run:
   cat .env
   # or on Windows:
   type .env
   ```

2. **Check file is in correct location:**
   ```
   Your project structure should be:
   IPD_CHD/
   ├── .env              ← HERE (not in src/)
   ├── package.json
   ├── src/
   └── ...
   ```

3. **Try manual test:**
   - Open browser console
   - Type: `import.meta.env.VITE_GEMINI_API_KEY`
   - Should show your key

4. **Last resort - Hardcode for testing:**
   - In `src/utils/geminiExtraction.js`
   - Temporarily replace: `const apiKey = import.meta.env.VITE_GEMINI_API_KEY;`
   - With: `const apiKey = 'AIzaSyDDwCk5dJTLyKtYN65v9DHdGTz_eHU9S_o';`
   - **REMOVE THIS AFTER TESTING!** (Don't commit hardcoded keys)

