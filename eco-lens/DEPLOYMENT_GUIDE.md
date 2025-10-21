# Eco-Lens Deployment Guide

## Backend Configuration ✅

Your backend is deployed at: **https://eco-lens-8bn1.onrender.com**

### Files Updated:

1. ✅ **Frontend Configuration** (`app.json`)
   - Updated `apiUrl` to production URL
   - Updated `mobileApiUrl` to production URL

2. ✅ **Backend CORS** (`backend/server.js`)
   - Added support for mobile app requests
   - Added Expo Go domain support
   - Enabled requests from deployed backend

3. ✅ **Backend Environment** (`backend/.env`)
   - Updated `FRONTEND_URL` to production URL

4. ✅ **EAS Build Configuration** (`eas.json`)
   - Already configured with production URLs

---

## Expo Deployment Commands

### Option 1: Publish Update (OTA - Over The Air)
**Use this for quick updates without rebuilding the app**

```bash
# Clear cache and publish
npx expo start --clear

# Then publish to Expo
npx expo publish
```

**Or use EAS Update (recommended):**
```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Publish update
eas update --branch production --message "Updated API to production backend"
```

---

### Option 2: Build APK/IPA for Store Distribution

#### **Android APK (Preview Build)**
```bash
# Build APK for testing
eas build --platform android --profile preview

# After build completes, download and install on device
```

#### **Android Production Build**
```bash
# Build production APK
eas build --platform android --profile production
```

#### **iOS Build**
```bash
# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production
```

---

### Option 3: Development Build
**For development with custom native code**

```bash
# Build development client
eas build --platform android --profile development
```

---

## Step-by-Step Deployment Process

### Step 1: Verify Configuration ✅
All configuration files have been updated. Verify:
- ✅ `app.json` - API URLs updated
- ✅ `eas.json` - Production environment configured
- ✅ Backend CORS configured for mobile apps

### Step 2: Test Locally First
```bash
# Start the app with production API
npx expo start --clear
```
- Press 'a' for Android or 'i' for iOS
- Test all features with production backend

### Step 3: Publish to Expo (Fastest Option)
```bash
# Login to Expo (if not logged in)
eas login

# Publish the update
eas update --branch production --message "Production deployment with Render backend"
```

### Step 4: Build APK (Optional - For Distribution)
```bash
# Build Android APK
eas build --platform android --profile preview

# Wait for build to complete (check status at expo.dev)
# Download APK and share with testers
```

---

## Environment Variables on Render

Make sure these are set in your Render dashboard:

### Required Environment Variables:
```bash
PORT=5002
MONGODB_URI=your_mongodb_connection_string
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
JWT_SECRET=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
BASE_URL=https://eco-lens-8bn1.onrender.com
FRONTEND_URL=https://eco-lens-8bn1.onrender.com
```

### Google OAuth Client IDs (Already in eas.json):
```bash
EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB=782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=782129521115-ciietm4n47j6odv749cmfl9vgbtkmcbg.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS=782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com
```

---

## Quick Commands Reference

### Development
```bash
# Start dev server
npx expo start --clear

# Start with production API
npx expo start --clear --no-dev --minify
```

### Publishing
```bash
# Quick OTA update
eas update --branch production

# With custom message
eas update --branch production --message "Your update message"
```

### Building
```bash
# Android Preview APK (fastest)
eas build --platform android --profile preview

# Android Production
eas build --platform android --profile production

# iOS Production
eas build --platform ios --profile production

# Both platforms
eas build --platform all --profile production
```

### Checking Build Status
```bash
# Check build status
eas build:list

# View specific build
eas build:view [build-id]
```

---

## Testing Production Backend

### Test API Endpoints:
```bash
# Health check
curl https://eco-lens-8bn1.onrender.com/api/health

# Get products (no auth required)
curl https://eco-lens-8bn1.onrender.com/api/products
```

---

## Troubleshooting

### Issue: "Network request failed"
**Solution:** Check backend is running on Render
```bash
# Test backend health
curl https://eco-lens-8bn1.onrender.com/api/health
```

### Issue: CORS errors
**Solution:** Backend CORS has been configured to accept mobile app requests

### Issue: Slow backend response
**Note:** Render free tier spins down after inactivity. First request may take 30-60 seconds to wake up the server.

### Issue: Authentication fails
**Solution:** Ensure JWT_SECRET is set in Render environment variables

---

## Recommended: Start with OTA Update

**Fastest deployment method:**

1. **Test locally** with production backend:
   ```bash
   npx expo start --clear
   ```

2. **Publish update** (no rebuild needed):
   ```bash
   eas update --branch production --message "Production backend deployment"
   ```

3. **Users get update** automatically when they restart the app

---

## Build for Google Play Store (Optional)

When ready for Play Store:

```bash
# 1. Build production APK/AAB
eas build --platform android --profile production

# 2. Submit to Play Store (requires setup)
eas submit --platform android

# 3. Follow Play Store Console instructions
```

---

## Important Notes

- ✅ Backend is configured to accept mobile app requests
- ✅ CORS allows Expo Go and custom builds
- ✅ Production API URLs are configured in all files
- ⚠️ Render free tier may sleep - expect cold starts
- ⚠️ Consider upgrading Render plan for production use

---

## Next Steps

1. **Test the app locally** with production backend
2. **Publish OTA update** for immediate deployment
3. **Build APK** when ready for wider distribution
4. **Monitor Render logs** for any backend issues

---

## Support

- Expo Docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction
- EAS Update: https://docs.expo.dev/eas-update/introduction
- Render Docs: https://render.com/docs
