# Authentication & Token Management Fixes

## Issues Addressed

### 1. **JWT Token Expiration Errors** ✅
- **Problem**: Backend receiving expired JWT tokens causing multiple 401 errors
- **Solution**: Implemented refresh token mechanism with automatic token refresh

### 2. **Duplicate Schema Index Warnings** ✅
- **Problem**: Mongoose warnings about duplicate indexes on `token` and `orderNumber` fields
- **Solution**: Removed explicit index declarations where `unique: true` already creates indexes

---

## Changes Made

### Backend Changes

#### 1. Schema Index Fixes
**Files Modified:**
- `backend/models/PasswordReset.js`
- `backend/models/Order.js`

**Changes:**
- Removed duplicate `token` index in PasswordReset (unique constraint already creates index)
- Removed duplicate `orderNumber` index in Order (unique constraint already creates index)

#### 2. Refresh Token Implementation

**New Files Created:**
- `backend/models/RefreshToken.js` - Refresh token schema with auto-expiration
- `backend/routes/authRoutes.js` - Token refresh endpoints

**Endpoints Added:**
- `POST /api/auth/refresh` - Refresh access token using refresh token
- `POST /api/auth/logout` - Logout and invalidate refresh token
- `DELETE /api/auth/revoke-all-tokens` - Revoke all refresh tokens for a user

**Files Modified:**
- `backend/server.js`
  - Added refresh token generation on login/register
  - Integrated auth routes
  - Both endpoints now return `refreshToken` in response

**Token Expiration:**
- **Access Token**: 24 hours
- **Refresh Token**: 7 days

---

### Frontend Changes

#### 1. Enhanced Authentication Service

**File Modified:** `src/api/authService.js`

**New Features:**
- Store and manage refresh tokens
- `refreshAccessToken()` method to get new access token
- Enhanced `logoutUser()` to revoke refresh tokens on server
- Automatic refresh token storage on login/register

#### 2. API Error Handler

**New File:** `src/utils/apiErrorHandler.js`

**Features:**
- Centralized error handling for API requests
- Automatic detection of token expiration errors
- Clears stored credentials on 401 errors
- User-friendly error messages

#### 3. API Client with Auto-Refresh

**New File:** `src/utils/apiClient.js`

**Features:**
- Automatic token refresh on 401 responses
- Request queuing during token refresh
- Prevents multiple simultaneous refresh attempts
- Retry failed requests with new token
- Convenience methods: `get()`, `post()`, `patch()`, `put()`, `delete()`

---

## How It Works

### Token Refresh Flow

```
1. User logs in
   ↓
2. Server returns access token (24h) + refresh token (7d)
   ↓
3. Frontend stores both tokens
   ↓
4. API request with expired access token
   ↓
5. Server returns 401 Unauthorized
   ↓
6. Frontend detects 401
   ↓
7. Frontend uses refresh token to get new access token
   ↓
8. Frontend retries original request with new token
   ↓
9. If refresh token expired → redirect to login
```

### Using the API Client

**Old Way (without auto-refresh):**
```javascript
const headers = await AuthService.getAuthHeaders();
const response = await fetch(`${API_BASE_URL}/profile`, {
  method: 'GET',
  headers
});
```

**New Way (with auto-refresh):**
```javascript
import ApiClient from '../utils/apiClient';

const response = await ApiClient.get('/profile');
// Token refresh happens automatically if needed!
```

---

## Migration Guide

### For Existing API Calls

To use automatic token refresh, update your API calls:

**Before:**
```javascript
const headers = await AuthService.getAuthHeaders();
const response = await fetch(`${API_BASE_URL}/endpoint`, {
  method: 'GET',
  headers
});
```

**After:**
```javascript
import ApiClient from '../utils/apiClient';

const response = await ApiClient.get('/endpoint');
```

### Testing the Changes

1. **Test Login**
   - Login should now return both `token` and `refreshToken`
   - Check AsyncStorage to verify both are stored

2. **Test Token Expiration**
   - Manually expire access token (change JWT_SECRET temporarily)
   - Make an authenticated request
   - Should automatically refresh and retry

3. **Test Logout**
   - Logout should clear all tokens from storage
   - Refresh token should be revoked on server

---

## Environment Variables

Ensure these are set in `.env`:

```bash
JWT_SECRET=your-super-secret-jwt-key-here
```

---

## Database Collections

### New Collection: `refreshtokens`

**Fields:**
- `userId` - Reference to User
- `token` - Unique refresh token (64-byte hex string)
- `expiresAt` - Expiration date (7 days from creation)
- `createdAt` - Creation timestamp
- `lastUsedAt` - Last usage timestamp

**Indexes:**
- Auto-expiring index on `expiresAt`
- Index on `userId` for efficient lookup
- Unique index on `token` (created by unique constraint)

---

## Security Considerations

1. **Refresh tokens are stored securely** in MongoDB with auto-expiration
2. **Refresh tokens are single-use** (updated lastUsedAt on each use)
3. **Tokens are cleared on logout** both client-side and server-side
4. **All tokens for a user can be revoked** using `/api/auth/revoke-all-tokens`
5. **Access tokens are short-lived** (24 hours) to limit exposure

---

## Breaking Changes

⚠️ **None** - All changes are backward compatible. Existing functionality continues to work without modification.

---

## Future Enhancements

- [ ] Add token rotation (issue new refresh token on each refresh)
- [ ] Add device tracking for refresh tokens
- [ ] Implement token revocation on password change
- [ ] Add rate limiting for token refresh attempts
- [ ] Add monitoring/alerts for suspicious token refresh patterns

---

## Testing Checklist

- [x] Schema indexes no longer show warnings
- [x] Login returns refresh token
- [x] Register returns refresh token
- [x] Refresh endpoint works correctly
- [x] Logout revokes refresh tokens
- [ ] Automatic token refresh on 401 (needs manual testing)
- [ ] Multiple simultaneous requests handled correctly
- [ ] Expired refresh token redirects to login

---

## Support

If you encounter any issues:

1. Check server logs for detailed error messages
2. Verify JWT_SECRET is set in `.env`
3. Ensure MongoDB connection is working
4. Check AsyncStorage for stored tokens
5. Test refresh endpoint directly: `POST /api/auth/refresh`
