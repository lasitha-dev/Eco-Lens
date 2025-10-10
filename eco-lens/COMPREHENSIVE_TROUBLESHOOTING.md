# Comprehensive Troubleshooting Guide

## Current Issues and Fixes

### 1. ReferenceError: Property 'Constants' doesn't exist

This error occurs because the `Constants` import is not properly resolved. I've already fixed this by:

1. **Adding proper imports** in oauthDebug.js
2. **Adding error handling** to prevent crashes when Constants is not available
3. **Adding import verification** in LoginScreen.js

### 2. Previous "Client Id property `androidClientId` must be defined" Error

This was resolved by:
1. **Adding fallback values** for OAuth client IDs
2. **Improving environment variable handling**
3. **Enhanced error handling and logging**

## Steps to Resolve Current Issues

### 1. Restart Development Servers Completely

```bash
# In your project root directory
# Stop all servers first

# Clear Expo cache
expo r -c

# Start frontend
expo start

# In another terminal, start backend
cd backend
npm start
```

### 2. Verify Package Installation

Make sure all required packages are installed:

```bash
# In your frontend directory
npm install expo-constants

# Check if all auth-related packages are installed
npm list expo-auth-session expo-constants
```

### 3. Check Environment Variables

Verify that your [.env](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS%20Code/Eco-Lens/eco-lens/.env) files have the correct format:

**Frontend [.env](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS%20Code/Eco-Lens/eco-lens/.env):**
```
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=782129521115-fiatnjkoic8dnkk6mmsjrh0tgha36lcr.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com
```

### 4. Check File Encoding

Ensure all files are saved in UTF-8 encoding without BOM:
- [.env](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS%20Code/Eco-Lens/eco-lens/.env) files
- [app.json](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS%20Code/Eco-Lens/eco-lens/app.json)
- JavaScript files

## Debugging Steps

### 1. Enable Verbose Logging

I've added comprehensive logging to help diagnose issues. When you run the app, look for these log messages in the console:

```
=== OAuth Configuration Debug ===
Environment Variables:
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB: SET
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID: SET
  EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS: SET
```

### 2. Check Import Verification Logs

Look for these messages in the console:
```
=== LoginScreen Imports ===
Constants available: true
Platform: android
```

### 3. Verify OAuth Configuration

The app now uses fallback values if environment variables are not set:
```javascript
// Corrected import example:
import oauthDebug from '../utils/oauthDebug';
const { debugOAuthConfig, extractTokensFromUrl } = oauthDebug;
```

## Common Solutions

### 1. Clear Cache and Restart

```bash
# Clear npm cache
npm start --reset-cache

# Or clear Expo cache
expo r -c
```

### 2. Reinstall Dependencies

```bash
# Remove node_modules and reinstall
rm -rf node_modules
npm install

# For Expo specific packages
expo install expo-constants expo-auth-session
```

### 3. Check Expo SDK Version Compatibility

Make sure your Expo SDK version supports the packages you're using:
- `expo-constants`: Compatible with SDK 49+
- `expo-auth-session`: Compatible with SDK 49+

Check your [app.json](file:///c:/Users/lasitha/OneDrive/Documents/IDEs/VS%20Code/Eco-Lens/eco-lens/app.json) for SDK version:
```json
{
  "expo": {
    "sdkVersion": "49.0.0"
  }
}
```

## Testing the Fix

### 1. Run Import Test

I've created a test file to verify imports are working. You can temporarily add this to your App.js to test:

```javascript
import oauthDebug from './src/utils/oauthDebug';

// Add this to your App component
useEffect(() => {
  const { debugOAuthConfig } = oauthDebug;
  debugOAuthConfig();
}, []);
```

### 2. Check Console Output

Look for these messages in your console:
- Import verification messages
- OAuth configuration debug messages
- Environment variable status

## If Issues Persist

1. **Share the complete error log** including the stack trace
2. **Verify your Expo and React Native versions**:
   ```bash
   expo --version
   npm list react-native expo
   ```

3. **Check if you're using Expo Go or development build**:
   - Expo Go has limitations with native modules
   - For production apps, consider using development builds

4. **Verify Google Cloud Console configuration**:
   - Ensure OAuth 2.0 Client IDs are correctly set up
   - Verify package names and fingerprints match exactly

## Additional Resources

- [Expo Constants Documentation](https://docs.expo.dev/versions/latest/sdk/constants/)
- [Expo Auth Session Documentation](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)