# Complete Google OAuth Fix Guide

## Current Issues Addressed

1. **Web Authentication Object Null**: Even with ID token in URL, authentication object is null
2. **Android Redirect URI Error**: "Access blocked: Authorization error" with `exp://` URLs
3. **Token Extraction**: Improved methods for extracting tokens from OAuth responses

## Solutions Implemented

### 1. Enhanced Token Extraction

We've implemented multiple methods to extract tokens:

```javascript
// Method 1: From authentication object (preferred)
if (authentication?.idToken) {
  // Use directly
}

// Method 2: From URL hash parameters
const urlObj = new URL(url);
const hashParams = new URLSearchParams(urlObj.hash.substring(1));
const idToken = hashParams.get('id_token');
```

### 2. Fixed Redirect URI for Mobile

Added proper redirect URI configuration for Expo apps:

```javascript
if (Platform.OS !== 'web') {
  config.redirectUri = `${Constants.expoConfig.scheme}://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8081`;
}
```

### 3. Google Cloud Console Configuration

You must add these redirect URIs to your Web Application OAuth client:

```
http://localhost:8081
http://localhost:19006
https://auth.expo.io/@your-username/eco-lens
```

## Required Actions

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your **Web Application** OAuth 2.0 Client ID
4. Add the redirect URIs listed above
5. Save changes

### 2. Find Your Expo Username

Run this command to find your Expo username:
```bash
expo whoami
```

Replace `your-username` in the redirect URI with your actual username.

### 3. Restart Development Servers

```bash
# Clear cache and restart
expo r -c
```

## Debugging Information

### Console Logs to Watch For

```
Google Auth Success - Authentication object: false
Response URL: http://localhost:8081/#state=...&id_token=...
Attempting to extract token from URL using utility function...
Successfully extracted ID Token from URL
```

### Platform-Specific Behavior

**Web**: Should work with direct token extraction from URL
**Android**: Requires proper redirect URI in Google Cloud Console

## Common Error Messages and Solutions

### "Access blocked: Authorization error" (Error 400: invalid_request)

**Cause**: Google doesn't accept `exp://` redirect URIs
**Solution**: Add `https://auth.expo.io/@your-username/eco-lens` to authorized redirect URIs

### "Authentication object is null"

**Cause**: Expo AuthSession sometimes fails to parse the response
**Solution**: Extract tokens directly from the URL hash

### "Failed to get authentication token"

**Cause**: Missing or incorrect OAuth configuration
**Solution**: Verify Google Cloud Console setup and environment variables

## Testing Checklist

- [ ] Google Cloud Console redirect URIs updated
- [ ] Expo username correctly used in redirect URI
- [ ] Environment variables properly set
- [ ] Development servers restarted with cache cleared
- [ ] Test on both web and mobile platforms

## Fallback Mechanisms

If ID tokens continue to be problematic:

1. **Access Token Fallback**: Use access token to fetch user info from Google API
2. **Custom ID Token Creation**: Create a compatible token for your backend
3. **Error Handling**: Provide clear user feedback for different error scenarios

## Security Considerations

1. **Token Storage**: Tokens are securely stored using AsyncStorage
2. **Backend Verification**: All tokens are verified server-side
3. **HTTPS Redirects**: Production should use HTTPS redirect URIs
4. **Scope Limitation**: Only request necessary scopes (`openid`, `profile`, `email`)

## Production Deployment Notes

For production deployment, you'll need to:

1. Create separate OAuth clients for production
2. Add production redirect URIs:
   ```
   https://yourdomain.com
   https://auth.expo.io/@your-username/your-production-app
   ```
3. Update environment variables with production client IDs

## Support and Troubleshooting

If issues persist:

1. Share complete console logs
2. Verify Google Cloud Console configuration matches exactly
3. Check that your Expo username is correct
4. Ensure all required redirect URIs are added

The implementation now handles both ideal and edge cases for Google OAuth across web and mobile platforms.