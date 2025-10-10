# Google Cloud Console Setup for Eco-Lens OAuth

## 🔧 Required OAuth 2.0 Client IDs

You need **TWO** separate OAuth 2.0 Client IDs in Google Cloud Console:

### 1. Web Application Client ID
**Client ID:** `782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com`

### 2. Android Client ID  
**Client ID:** `782129521115-ciietm4n47j6odv749cmfl9vgbtkmcbg.apps.googleusercontent.com`

---

## 📋 Web Application OAuth Client Configuration

### Required Fields:

1. **Application type:** Web application
2. **Name:** Eco-Lens Web (or any name you prefer)

### ✅ Authorized JavaScript origins:
```
http://localhost:8081
http://localhost:19006
http://localhost:5002
http://10.38.245.146:8081
http://10.38.245.146:19006
```

### ✅ Authorized redirect URIs:
```
http://localhost:8081
http://localhost:19006
http://localhost:8081/auth/google/callback
https://auth.expo.io/@coder_lasitha/eco-lens
```

**CRITICAL:** The redirect URI `https://auth.expo.io/@coder_lasitha/eco-lens` is required for Expo Go mobile authentication!

---

## 📱 Android OAuth Client Configuration

### Required Fields:

1. **Application type:** Android
2. **Name:** Eco-Lens Android (or any name you prefer)

### ✅ Package name:
```
com.ecolens.app
```

### ✅ SHA-1 certificate fingerprint:

You need to provide the SHA-1 fingerprint from your Android debug keystore.

#### To get your SHA-1 fingerprint:

**On Windows (PowerShell):**
```powershell
cd android
./gradlew signingReport
```

**On Mac/Linux:**
```bash
cd android
./gradlew signingReport
```

Look for the **debug** variant and copy the **SHA1** fingerprint. It will look like:
```
SHA1: A1:B2:C3:D4:E5:F6:G7:H8:I9:J0:K1:L2:M3:N4:O5:P6:Q7:R8:S9:T0
```

**Alternatively, you can use keytool:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

---

## 🔍 How to Find Your Expo Username

Your current Expo username appears to be: **`coder_lasitha`**

To verify, run:
```bash
expo whoami
```

If you need to change the redirect URI format, use:
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/eco-lens
```

---

## ⚙️ Complete Setup Steps

### Step 1: Go to Google Cloud Console
1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** > **Credentials**

### Step 2: Configure Web Application Client

1. Find your Web Application OAuth 2.0 Client ID
   - Client ID: `782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com`
2. Click **Edit** (pencil icon)
3. Add all **Authorized JavaScript origins** listed above
4. Add all **Authorized redirect URIs** listed above
5. Click **Save**

### Step 3: Configure Android Client

1. Find your Android OAuth 2.0 Client ID
   - Client ID: `782129521115-ciietm4n47j6odv749cmfl9vgbtkmcbg.apps.googleusercontent.com`
2. Click **Edit** (pencil icon)
3. Set **Package name:** `com.ecolens.app`
4. Get your SHA-1 fingerprint (see instructions above)
5. Add the SHA-1 fingerprint to the **SHA-1 certificate fingerprint** field
6. Click **Save**

### Step 4: Wait for Propagation
- Google OAuth changes can take **5-10 minutes** to propagate
- Don't test immediately after making changes

### Step 5: Restart Your Development Environment
```bash
# Clear Expo cache
expo r -c

# Restart backend server
cd backend
node server.js
```

---

## 🐛 Troubleshooting

### Error: "Something went wrong trying to finish signing in"
**Cause:** Redirect URI not configured correctly in Google Cloud Console  
**Solution:** Verify `https://auth.expo.io/@coder_lasitha/eco-lens` is added to Web Application redirect URIs

### Error: "Access blocked: Authorization error"
**Cause:** Android client not properly configured with SHA-1 fingerprint  
**Solution:** Run `./gradlew signingReport` and add the SHA-1 to Android client configuration

### Error: "redirect_uri_mismatch"
**Cause:** The redirect URI in the request doesn't match any authorized URIs  
**Solution:** Double-check all redirect URIs are added exactly as shown above

### Error: "Invalid Google token" (backend error)
**Cause:** Backend cannot verify the token with the provided client ID  
**Solution:** Ensure both Web and Android client IDs in `.env` and `backend/.env` match Google Cloud Console

---

## 📝 Summary Checklist

### Web Application Client:
- [ ] Authorized JavaScript origins added (5 origins)
- [ ] Authorized redirect URIs added (4 URIs including Expo auth proxy)
- [ ] Client ID matches: `782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com`

### Android Client:
- [ ] Package name set to: `com.ecolens.app`
- [ ] SHA-1 fingerprint added (from debug keystore)
- [ ] Client ID matches: `782129521115-ciietm4n47j6odv749cmfl9vgbtkmcbg.apps.googleusercontent.com`

### Environment Files:
- [ ] `.env` has correct Android client ID
- [ ] `app.json` has correct Android client ID
- [ ] `backend/.env` has correct Android client ID
- [ ] All files use same client IDs consistently

### Testing:
- [ ] Waited 5-10 minutes after Google Cloud Console changes
- [ ] Cleared Expo cache (`expo r -c`)
- [ ] Restarted backend server
- [ ] Tested on physical device or emulator

---

## 🎯 Expected Behavior After Setup

### Web Browser:
✅ Sign in with Google → Opens Google consent → Returns to app → Logged in

### Mobile (Expo Go):
✅ Sign in with Google → Opens Google consent in browser → Shows "You may close this window" → Returns to app → Logged in

---

## 📞 Support

If you continue to have issues:
1. Check backend server logs for detailed error messages
2. Check mobile app console logs (use `adb logcat` for Android)
3. Verify all client IDs match between Google Cloud Console and your environment files
4. Ensure SHA-1 fingerprint is correct for your debug keystore
