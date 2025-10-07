# Platform-Specific OAuth Guide

## Your Current Situation

Based on your comment that you haven't set up iOS, here's what you need to know:

### What You Need Right Now

Since you're likely testing on **Android** (based on the error message), you only need:

1. **Android OAuth 2.0 Client ID** - ✅ Already configured with fallback
2. **Web OAuth 2.0 Client ID** - ✅ Already configured with fallback

You **don't need** iOS OAuth setup unless you're testing on iOS devices.

### Current Configuration Status

✅ **Android**: Configured with fallback value
✅ **Web**: Configured with fallback value
⏹️ **iOS**: Not configured (but not needed for Android testing)

## Why You're Still Getting Errors

The issue is likely not with missing iOS setup, but with one of these possibilities:

1. **Environment variables not loading properly**
2. **Google Cloud Console configuration issues**
3. **Development server cache issues**

## Quick Fixes to Try

### 1. Restart Everything
```bash
# In your frontend directory
expo r -c

# In your backend directory
npm start
```

### 2. Verify Android OAuth in Google Cloud Console

Make sure you have an OAuth 2.0 Client ID for Android with:
- **Package name**: `com.ecolens.app`
- **SHA-1 fingerprint**: Get from your debug keystore

### 3. Check Environment Variables

Your [.env](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS Code/Eco-Lens/eco-lens/.env) should have:
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=782129521115-fiatnjkoic8dnkk6mmsjrh0tgha36lcr.apps.googleusercontent.com
```

## Platform-Specific Requirements

### For Android Testing (Your Current Need)
✅ Android OAuth 2.0 Client ID
✅ Web OAuth 2.0 Client ID
⏹️ iOS OAuth 2.0 Client ID (optional)

### For iOS Testing (Future Need)
✅ iOS OAuth 2.0 Client ID
✅ Web OAuth 2.0 Client ID
⏹️ Android OAuth 2.0 Client ID (optional)

### For Web Testing
✅ Web OAuth 2.0 Client ID
⏹️ Android OAuth 2.0 Client ID (optional)
⏹️ iOS OAuth 2.0 Client ID (optional)

## Debugging Steps for Android

1. **Check console logs** for these messages:
   ```
   Google Auth Config: {clientId: "...", androidClientId: "...", webClientId: "..."}
   ```

2. **Verify the Android Client ID** is present in the config

3. **Test on Android emulator/simulator** first before physical device

## If You Want to Set Up iOS Later

When you're ready to test on iOS:

1. Create iOS OAuth 2.0 Client ID in Google Cloud Console
2. Add to your [.env](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS%20Code/Eco-Lens/eco-lens/.env) file:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=your-ios-client-id-here
   ```

3. Update [app.json](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS%20Code/Eco-Lens/eco-lens/app.json) with iOS client ID

## Current Solution

The app is already configured to work without iOS setup by:
- Using fallback values for required client IDs
- Only including configured client IDs in the auth request
- Providing platform-specific error messages

You should be able to test Google OAuth on Android without any iOS configuration.