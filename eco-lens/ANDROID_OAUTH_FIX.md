# Android OAuth Redirect URI Fix

## Current Issue

You're getting "Access blocked: Authorization error" with redirect_uri=eco-lens://expo-development-client/

## Root Cause

Google OAuth doesn't accept custom scheme redirect URIs like `eco-lens://`. You need to use Expo's auth proxy service.

## Solution

### 1. Update LoginScreen.js (Already Done)

I've already updated your LoginScreen.js to use Expo's auth proxy:
```javascript
config.redirectUri = 'https://auth.expo.io/@your-username/eco-lens';
```

### 2. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your **Web Application** OAuth 2.0 Client ID
4. Add this authorized redirect URI:
   ```
   https://auth.expo.io/@your-username/eco-lens
   ```

### 3. Find Your Expo Username

Run this command in your project directory:
```bash
expo whoami
```

Replace `your-username` in the redirect URI with your actual Expo username.

### 4. Example Configuration

If your Expo username is "john_doe", add this redirect URI:
```
https://auth.expo.io/@john_doe/eco-lens
```

## Why This Works

1. **Expo Auth Proxy**: Expo provides a proxy service at `https://auth.expo.io` that Google trusts
2. **Proper Redirect**: Google accepts HTTPS redirect URIs from trusted domains
3. **Token Forwarding**: Expo forwards the OAuth tokens back to your app

## Testing Steps

1. **Update Google Cloud Console** with the new redirect URI
2. **Wait 5-10 minutes** for Google to propagate the changes
3. **Restart your development servers**:
   ```bash
   expo r -c
   ```
4. **Test on Android device**

## Common Issues and Solutions

### "Access blocked: Authorization error"
- **Cause**: Redirect URI not authorized in Google Cloud Console
- **Solution**: Add `https://auth.expo.io/@your-username/eco-lens` to authorized redirect URIs

### "Invalid redirect URI"
- **Cause**: Incorrect Expo username or app slug
- **Solution**: Verify your Expo username and app slug match exactly

### "OAuth Error"
- **Cause**: Network connectivity issues
- **Solution**: Ensure device and computer are on the same network

## Production Considerations

For production apps, you'll need to:
1. Create a separate OAuth client for production
2. Add production redirect URIs:
   ```
   https://auth.expo.io/@your-username/your-production-app
   ```
3. Update environment variables with production client IDs

## Debugging

Check the console logs for:
```
Using Expo auth proxy redirect URI for mobile
https://auth.expo.io/@your-username/eco-lens
```

This indicates the fix is properly configured.

## Support

If issues persist:
1. Verify the redirect URI exactly matches what's in Google Cloud Console
2. Check that your Expo username is correct
3. Ensure you've waited for Google to propagate the changes