# Backend Server Startup Guide - Notification Feature Fix

## 🔧 Issues Fixed

1. **Authentication Middleware Added**: All notification routes now require authentication
2. **CORS Configuration Updated**: Development mode now allows all origins for easier testing
3. **Backend Routes Verified**: All notification endpoints are properly registered

## 📋 Prerequisites

Before starting the backend server, ensure you have:

- Node.js installed (v14 or higher)
- MongoDB Atlas connection string in `.env` file
- All required environment variables configured

## 🚀 Quick Start

### Step 1: Navigate to Backend Directory

```powershell
cd C:\Users\Ayodhya\Desktop\Eco-Lens\eco-lens\backend
```

### Step 2: Install Dependencies (if not already installed)

```powershell
npm install
```

### Step 3: Verify Environment Variables

Check that your `.env` file contains:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
PORT=5002
NODE_ENV=development
```

### Step 4: Start the Backend Server

```powershell
npm start
```

Or for development with auto-reload:

```powershell
npm run dev
```

### Step 5: Verify Server is Running

You should see output like:

```
✅ Successfully connected to MongoDB Atlas
Database Name: your_database_name
Server running on port 5002
Available at:
  - Local: http://localhost:5002
  - Network: http://10.38.245.146:5002
```

## 🔍 Testing the Notification Endpoints

Once the server is running, you can test the endpoints:

### 1. Get Notifications (requires authentication)

```bash
GET http://localhost:5002/api/notifications
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. Update Weekly Summary Opt-In

```bash
POST http://localhost:5002/api/notifications/opt-in
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
  Content-Type: application/json
Body:
  {
    "optIn": true
  }
```

### 3. Get Latest Weekly Summary

```bash
GET http://localhost:5002/api/notifications/latest-summary
Headers:
  Authorization: Bearer YOUR_JWT_TOKEN
```

## 🐛 Troubleshooting

### Issue: "ERR_CONNECTION_TIMED_OUT"

**Solution**: Make sure the backend server is running. Check the terminal where you started the server.

### Issue: "401 Unauthorized"

**Solution**: Ensure you're sending a valid JWT token in the Authorization header. The token should be obtained from the login endpoint.

### Issue: "MongoDB connection error"

**Solution**: 
1. Check your MONGODB_URI in the `.env` file
2. Ensure your IP address is whitelisted in MongoDB Atlas
3. Verify your MongoDB Atlas credentials

### Issue: "Port 5002 already in use"

**Solution**: 
1. Find and kill the process using port 5002:
   ```powershell
   netstat -ano | findstr :5002
   taskkill /PID <PID_NUMBER> /F
   ```
2. Or change the PORT in your `.env` file

## 📱 Frontend Configuration

The frontend is already configured to connect to:
- **Web**: `http://localhost:5002/api`
- **Mobile**: `http://10.38.245.146:5002/api` (auto-detected)

## ✅ Verification Checklist

- [ ] Backend server is running on port 5002
- [ ] MongoDB connection is successful
- [ ] Frontend can reach the backend (check browser console)
- [ ] Authentication tokens are being sent correctly
- [ ] CORS errors are resolved

## 🔐 Authentication Flow

1. User logs in via `/api/login` or `/api/register`
2. Backend returns JWT token
3. Frontend stores token in AsyncStorage
4. Frontend includes token in Authorization header for all API requests
5. Backend authenticateToken middleware validates the token
6. Request proceeds to route handler

## 📊 Available Notification Endpoints

All endpoints require authentication:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| GET | `/api/notifications/latest-summary` | Get latest weekly summary |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| PUT | `/api/notifications/mark-all-read` | Mark all as read |
| DELETE | `/api/notifications/:id` | Delete a notification |
| DELETE | `/api/notifications` | Delete all notifications |
| POST | `/api/notifications/update-push-token` | Update Expo push token |
| POST | `/api/notifications/opt-in` | Toggle weekly summaries |
| POST | `/api/notifications/trigger-weekly` | Trigger weekly summary (testing) |
| GET | `/api/notifications/scheduler-status` | Get scheduler status |

## 🎯 Next Steps

After starting the backend:

1. Open your frontend app (web or mobile)
2. Login with your credentials
3. Navigate to Notification Settings
4. Toggle the weekly summary option
5. Check the browser/app console for any errors

## 📞 Support

If you continue to experience issues:

1. Check the backend terminal for error messages
2. Check the browser console for network errors
3. Verify your JWT token is valid and not expired
4. Ensure MongoDB is accessible from your network
