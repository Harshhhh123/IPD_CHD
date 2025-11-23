# Gemini API Setup Guide

## Step-by-Step Instructions to Get Your Free Gemini API Key

### Method 1: Google AI Studio (Recommended - Easiest)

1. **Go to Google AI Studio:**
   - Visit: https://aistudio.google.com/app/apikey
   - Or search "Google AI Studio" in your browser

2. **Sign In:**
   - Click "Sign in" or "Get API Key"
   - Use your Google account (Gmail account works)
   - Accept terms if prompted

3. **Create API Key:**
   - Click the **"Create API Key"** button (usually a big blue button)
   - If you see "Get API Key in Google AI Studio", click that
   - You may be asked to create a Google Cloud project (just click "Create" - it's free)

4. **Copy Your Key:**
   - Your API key will appear (looks like: `AIzaSy...`)
   - **IMPORTANT:** Copy it immediately - you won't see it again!
   - Click "Copy" or select and copy manually

5. **Set Up in Your Project:**
   - Create a file named `.env` in your project root (same folder as `package.json`)
   - Add this line (replace with your actual key):
   ```
   VITE_GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```
   - Save the file

6. **Restart Your Dev Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### Method 2: Google Cloud Console (If Method 1 doesn't work)

1. Go to: https://console.cloud.google.com/
2. Sign in with Google account
3. Create a new project (or select existing)
4. Enable "Generative Language API"
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" > "API Key"
7. Copy the key

### Permissions & Limits

- **No special permissions needed** - the API key works automatically
- **Free Tier Limits:**
  - 15 requests per minute
  - 1,500 requests per day
  - Completely free for this usage

### Troubleshooting

**If you get "API key not valid":**
- Make sure you copied the entire key (they're long)
- Check for extra spaces in `.env` file
- Restart your dev server after creating `.env`

**If you get "Model not found" error:**
- Your API key should work with `gemini-1.5-pro`
- If not, the code will show a clear error message
- Try creating a new API key

**If API key creation fails:**
- Make sure you're signed in with a Google account
- Try a different browser
- Clear browser cache and try again

