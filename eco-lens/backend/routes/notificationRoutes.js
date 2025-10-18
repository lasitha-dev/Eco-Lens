const express = require('express');
const router = express.Router();
const NotificationService = require('../services/NotificationService');
const WeeklySummaryScheduler = require('../services/WeeklySummaryScheduler');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { limit = 20, skip = 0, type, isRead } = req.query;

    const options = {
      limit: parseInt(limit),
      skip: parseInt(skip),
      type: type || null,
      isRead: isRead !== undefined ? isRead === 'true' : null
    };

    const notifications = await NotificationService.getUserNotifications(userId, options);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      notifications,
      unreadCount,
      total: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const count = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * @route   GET /api/notifications/latest-summary
 * @desc    Get latest weekly summary
 * @access  Private
 */
router.get('/latest-summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const summary = await NotificationService.getLatestWeeklySummary(userId);

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error fetching latest summary:', error);
    res.status(500).json({ error: 'Failed to fetch latest summary' });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

/**
 * @route   PUT /api/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * @route   DELETE /api/notifications
 * @desc    Delete all notifications for a user
 * @access  Private
 */
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await Notification.deleteMany({ user: userId });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} notifications`
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

/**
 * @route   POST /api/notifications/update-push-token
 * @desc    Update user's Expo push token
 * @access  Private
 */
router.post('/update-push-token', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { expoPushToken: pushToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Push token updated successfully'
    });
  } catch (error) {
    console.error('Error updating push token:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
});

/**
 * @route   POST /api/notifications/opt-in
 * @desc    Opt in/out of weekly summaries
 * @access  Private
 */
router.post('/opt-in', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { optIn } = req.body;

    if (typeof optIn !== 'boolean') {
      return res.status(400).json({ error: 'optIn must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { weeklySummaryOptIn: optIn },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      message: `Weekly summaries ${optIn ? 'enabled' : 'disabled'}`,
      weeklySummaryOptIn: user.weeklySummaryOptIn
    });
  } catch (error) {
    console.error('Error updating opt-in status:', error);
    res.status(500).json({ error: 'Failed to update opt-in status' });
  }
});

/**
 * @route   POST /api/notifications/trigger-weekly
 * @desc    Manually trigger weekly summary (for testing)
 * @access  Private (Admin only in production)
 */
router.post('/trigger-weekly', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const result = await NotificationService.sendWeeklySummary(userId);

    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Error triggering weekly summary:', error);
    res.status(500).json({ error: 'Failed to trigger weekly summary' });
  }
});

/**
 * @route   GET /api/notifications/scheduler-status
 * @desc    Get scheduler status
 * @access  Private (Admin only in production)
 */
router.get('/scheduler-status', authenticateToken, async (req, res) => {
  try {
    const status = WeeklySummaryScheduler.getStatus();

    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    res.status(500).json({ error: 'Failed to get scheduler status' });
  }
});

module.exports = router;
