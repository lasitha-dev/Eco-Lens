# Weekly Notifications - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

**Backend:**
```bash
cd eco-lens/backend
npm install
```

**Frontend:**
```bash
cd eco-lens
npm install
```

### Step 2: Start the Backend Server

```bash
cd eco-lens/backend
npm start
```

You should see:
```
✅ Successfully connected to MongoDB Atlas
✅ Weekly summary scheduler started (Sundays at 9:00 AM UTC)
Server running on port 5002
```

### Step 3: Start the Frontend App

```bash
cd eco-lens
npx expo start
```

---

## 📱 Testing the Feature

### Test 1: View Notifications Screen
1. Navigate to the Notifications screen (needs to be added to navigation)
2. You should see an empty state: "No Notifications"

### Test 2: Trigger a Test Notification
1. Navigate to Notification Settings screen
2. Ensure "Weekly Eco-Report" is enabled
3. Tap "Send Test Notification"
4. Check the Notifications screen for the new notification

### Test 3: Manual API Test

**Using curl or Postman:**

```bash
# Get user ID from your database or AsyncStorage
USER_ID="your-user-id-here"

# Trigger weekly summary
curl -X POST http://10.38.245.146:5002/api/notifications/trigger-weekly \
  -H "Content-Type: application/json" \
  -d "{\"userId\": \"$USER_ID\"}"

# Get notifications
curl http://10.38.245.146:5002/api/notifications?userId=$USER_ID

# Get unread count
curl http://10.38.245.146:5002/api/notifications/unread-count?userId=$USER_ID
```

---

## 🔧 Configuration

### Change Scheduler Time
Edit `backend/services/WeeklySummaryScheduler.js`:

```javascript
// Current: Every Sunday at 9:00 AM UTC
this.job = cron.schedule('0 9 * * 0', async () => {
  // ...
});

// For testing: Every 5 minutes
this.job = cron.schedule('*/5 * * * *', async () => {
  // ...
});
```

### Customize Messages
Edit `backend/services/NotificationService.js` in the `generateWeeklySummaryMessage()` method.

---

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notifications` | GET | Get all notifications |
| `/api/notifications/unread-count` | GET | Get unread count |
| `/api/notifications/latest-summary` | GET | Get latest weekly summary |
| `/api/notifications/:id/read` | PUT | Mark as read |
| `/api/notifications/mark-all-read` | PUT | Mark all as read |
| `/api/notifications/:id` | DELETE | Delete notification |
| `/api/notifications` | DELETE | Delete all |
| `/api/notifications/update-push-token` | POST | Update push token |
| `/api/notifications/opt-in` | POST | Toggle weekly summaries |
| `/api/notifications/trigger-weekly` | POST | Manual trigger |

---

## 🐛 Troubleshooting

### Scheduler Not Starting
**Check:** MongoDB connection is successful
**Solution:** Ensure MONGODB_URI is set in `.env`

### No Notifications Received
**Check:** User has `weeklySummaryOptIn: true`
**Solution:** Use the settings screen to enable weekly summaries

### Push Notifications Not Working
**Check:** Expo push token is registered
**Solution:** Implement App.js notification setup (see remaining tasks)

### 404 on API Endpoints
**Check:** Routes are registered in `server.js`
**Solution:** Verify line 763 has `app.use('/api/notifications', notificationRoutes);`

---

## 📊 Scheduler Status

Check if the scheduler is running:

```bash
curl http://10.38.245.146:5002/api/notifications/scheduler-status
```

Response:
```json
{
  "success": true,
  "status": {
    "isRunning": true,
    "nextRun": "Every Sunday at 9:00 AM UTC"
  }
}
```

---

## 🎯 Next Steps

1. **Complete App.js Integration**
   - Add notification listeners
   - Register for push notifications
   - Handle notification responses

2. **Register Navigation Routes**
   - Add NotificationsScreen to navigator
   - Add NotificationSettingsScreen to navigator
   - Configure deep linking

3. **Create Dashboard Widget** (Optional)
   - GoalSummaryWidget component
   - Display latest weekly summary
   - Animated progress bar

4. **Production Deployment**
   - Set up proper cron job timing
   - Configure Expo push notification credentials
   - Test on physical devices

---

## 📖 Documentation

- **Full Implementation Guide:** `WEEKLY_NOTIFICATIONS_IMPLEMENTATION.md`
- **API Documentation:** See backend routes file
- **Testing Guide:** Create comprehensive test cases

---

## ✅ Checklist

- [x] Backend models created
- [x] Backend services implemented
- [x] API routes registered
- [x] Frontend utilities created
- [x] Notification screens built
- [x] Settings screen built
- [ ] App.js integration
- [ ] Navigation routes registered
- [ ] Dashboard widget (optional)
- [ ] Production testing

---

**Status:** 🟡 Nearly Complete - Ready for Integration Testing

**Last Updated:** October 18, 2025
