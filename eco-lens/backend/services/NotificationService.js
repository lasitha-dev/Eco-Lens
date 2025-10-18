const { Expo } = require('expo-server-sdk');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * NotificationService
 * Handles push notifications and in-app notifications
 */
class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  /**
   * Calculate weekly sustainability performance
   * @param {String} userId - User ID
   * @param {Date} startDate - Start of the week
   * @param {Date} endDate - End of the week
   * @returns {Object} Performance metrics
   */
  async calculateWeeklyPerformance(userId, startDate, endDate) {
    try {
      const orders = await Order.find({
        user: userId,
        createdAt: { $gte: startDate, $lte: endDate },
        paymentStatus: 'paid'
      });

      if (orders.length === 0) {
        return {
          hasActivity: false,
          orderCount: 0,
          averageScore: 0,
          totalSpent: 0,
          topGrade: null
        };
      }

      let totalScore = 0;
      let scoreCount = 0;
      let totalSpent = 0;
      const grades = {};

      orders.forEach(order => {
        totalSpent += order.totalAmount;
        
        order.items.forEach(item => {
          if (item.sustainabilityScore) {
            totalScore += item.sustainabilityScore;
            scoreCount++;
          }
          if (item.sustainabilityGrade) {
            grades[item.sustainabilityGrade] = (grades[item.sustainabilityGrade] || 0) + 1;
          }
        });
      });

      const averageScore = scoreCount > 0 ? totalScore / scoreCount : 0;
      const topGrade = Object.keys(grades).sort()[0] || null;

      return {
        hasActivity: true,
        orderCount: orders.length,
        averageScore: Math.round(averageScore),
        totalSpent,
        topGrade,
        grades
      };
    } catch (error) {
      console.error('Error calculating weekly performance:', error);
      throw error;
    }
  }

  /**
   * Generate dynamic message based on performance
   * @param {Object} performance - Performance metrics
   * @param {String} userName - User's first name
   * @returns {Object} Title and message
   */
  generateWeeklySummaryMessage(performance, userName) {
    if (!performance.hasActivity) {
      return {
        title: '🌱 Weekly Eco-Lens Summary',
        message: `Hi ${userName}! We missed you this week. Check out our sustainable products and start your eco-journey!`,
        tier: 'no_activity',
        actionUrl: 'ecolens://products'
      };
    }

    const { averageScore, orderCount, topGrade } = performance;

    // Excellent performance (80%+)
    if (averageScore >= 80) {
      return {
        title: '🌟 Outstanding Eco-Performance!',
        message: `Amazing work, ${userName}! You made ${orderCount} sustainable ${orderCount === 1 ? 'purchase' : 'purchases'} with an ${averageScore}% eco-score. You're a sustainability champion!`,
        tier: 'excellent',
        actionUrl: 'ecolens://dashboard'
      };
    }

    // Good performance (50-79%)
    if (averageScore >= 50) {
      return {
        title: '💚 Great Eco-Progress!',
        message: `Well done, ${userName}! ${orderCount} ${orderCount === 1 ? 'purchase' : 'purchases'} this week with a ${averageScore}% eco-score. Keep up the good work!`,
        tier: 'good',
        actionUrl: 'ecolens://dashboard'
      };
    }

    // Low performance (<50%)
    return {
      title: '🌿 Room for Improvement',
      message: `Hi ${userName}, you made ${orderCount} ${orderCount === 1 ? 'purchase' : 'purchases'} with a ${averageScore}% eco-score. Let's find more sustainable options together!`,
      tier: 'low',
      actionUrl: 'ecolens://products?filter=sustainable'
    };
  }

  /**
   * Create in-app notification
   * @param {String} userId - User ID
   * @param {String} type - Notification type
   * @param {String} title - Notification title
   * @param {String} message - Notification message
   * @param {Object} data - Additional data
   * @returns {Object} Created notification
   */
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = new Notification({
        user: userId,
        type,
        title,
        message,
        data,
        actionUrl: data.actionUrl || null,
        priority: data.priority || 'medium',
        expiresAt: data.expiresAt || null
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send push notification via Expo
   * @param {String} pushToken - Expo push token
   * @param {String} title - Notification title
   * @param {String} body - Notification body
   * @param {Object} data - Additional data
   * @returns {Object} Receipt
   */
  async sendPushNotification(pushToken, title, body, data = {}, userId = null) {
    try {
      // Validate push token
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Invalid Expo push token: ${pushToken}`);
        // Remove invalid token from user record
        if (userId) {
          await User.findByIdAndUpdate(userId, { expoPushToken: null });
          console.log(`Removed invalid token for user ${userId}`);
        }
        return { success: false, error: 'Invalid push token' };
      }

      // Get unread notification count for badge
      let badgeCount = 1;
      if (userId) {
        badgeCount = await Notification.countDocuments({ user: userId, isRead: false });
      }

      const message = {
        to: pushToken,
        sound: 'default',
        title,
        body,
        data: {
          ...data,
          userId: userId || data.userId,
          timestamp: new Date().toISOString()
        },
        badge: badgeCount,
        priority: 'high',
        channelId: data.type === 'weekly_summary' ? 'weekly-summaries' : 'default'
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
          
          // Check for errors in tickets
          for (const ticket of ticketChunk) {
            if (ticket.status === 'error') {
              console.error('Push notification error:', ticket.message);
              
              // Handle specific errors
              if (ticket.details?.error === 'DeviceNotRegistered') {
                // Remove invalid token
                if (userId) {
                  await User.findByIdAndUpdate(userId, { expoPushToken: null });
                  console.log(`Removed expired token for user ${userId}`);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
          
          // Handle rate limiting
          if (error.message && error.message.includes('MessageRateExceeded')) {
            console.warn('Rate limit exceeded, will retry later');
            return { success: false, error: 'Rate limit exceeded', retry: true };
          }
          
          // Handle message too big
          if (error.message && error.message.includes('MessageTooBig')) {
            console.error('Message payload too large');
            return { success: false, error: 'Message too big' };
          }
        }
      }

      return { success: true, tickets };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send weekly summary to a user
   * @param {String} userId - User ID
   * @returns {Object} Result
   */
  async sendWeeklySummary(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if user opted in for weekly summaries
      if (!user.weeklySummaryOptIn) {
        return { success: false, reason: 'User opted out' };
      }

      // Calculate date range (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      // Calculate performance
      const performance = await this.calculateWeeklyPerformance(userId, startDate, endDate);

      // Generate message
      const { title, message, tier, actionUrl } = this.generateWeeklySummaryMessage(
        performance,
        user.firstName
      );

      // Create in-app notification
      const notification = await this.createNotification(
        userId,
        'weekly_summary',
        title,
        message,
        {
          actionUrl,
          tier,
          performance,
          weekStart: startDate,
          weekEnd: endDate
        }
      );

      // Generate dynamic body text based on performance
      let dynamicBody = message;
      if (performance.hasActivity) {
        const { orderCount, averageScore } = performance;
        
        // Check for completed goals (you'll need to integrate with SustainabilityGoal model)
        // For now, using orderCount as proxy
        const completedGoals = 0; // TODO: Query actual completed goals
        
        if (completedGoals > 0) {
          dynamicBody = `You completed ${completedGoals} ${completedGoals === 1 ? 'goal' : 'goals'}! ${orderCount} eco-purchases made this week.`;
        } else if (averageScore > 80) {
          dynamicBody = `Almost there! ${averageScore}% progress on your goals this week.`;
        } else if (orderCount > 0) {
          dynamicBody = `You made ${orderCount} sustainable ${orderCount === 1 ? 'purchase' : 'purchases'} this week! Keep it up!`;
        } else {
          dynamicBody = 'Check your weekly progress summary now!';
        }
      }

      // Send push notification if user has a push token
      let pushResult = null;
      if (user.expoPushToken) {
        pushResult = await this.sendPushNotification(
          user.expoPushToken,
          'Your Weekly Eco-Lens Summary 🌱',
          dynamicBody,
          {
            type: 'weekly_summary',
            screen: 'SustainabilityGoals',
            userId: userId.toString(),
            notificationId: notification._id.toString(),
            actionUrl,
            tier,
            performance: {
              orderCount: performance.orderCount,
              averageScore: performance.averageScore
            }
          },
          userId
        );
      }

      return {
        success: true,
        notification,
        pushSent: pushResult?.success || false,
        pushResult,
        tier
      };
    } catch (error) {
      console.error('Error sending weekly summary:', error);
      throw error;
    }
  }

  /**
   * Send achievement notification
   * @param {String} userId - User ID
   * @param {String} achievementTitle - Achievement title
   * @param {String} achievementMessage - Achievement message
   * @param {Object} data - Additional data
   * @returns {Object} Result
   */
  async sendAchievementNotification(userId, achievementTitle, achievementMessage, data = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const title = `🏆 ${achievementTitle}`;
      const message = achievementMessage;

      // Create in-app notification
      const notification = await this.createNotification(
        userId,
        'achievement',
        title,
        message,
        {
          ...data,
          priority: 'high'
        }
      );

      // Send push notification if user has a push token
      let pushResult = null;
      if (user.expoPushToken) {
        pushResult = await this.sendPushNotification(
          user.expoPushToken,
          title,
          message,
          { notificationId: notification._id.toString(), ...data }
        );
      }

      return {
        success: true,
        notification,
        pushSent: !!pushResult
      };
    } catch (error) {
      console.error('Error sending achievement notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   * @param {String} userId - User ID
   * @param {Object} options - Query options
   * @returns {Array} Notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const {
        limit = 20,
        skip = 0,
        type = null,
        isRead = null
      } = options;

      const query = { user: userId };
      if (type) query.type = type;
      if (isRead !== null) query.isRead = isRead;

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .lean();

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get latest weekly summary for a user
   * @param {String} userId - User ID
   * @returns {Object} Latest weekly summary notification
   */
  async getLatestWeeklySummary(userId) {
    try {
      const notification = await Notification.findOne({
        user: userId,
        type: 'weekly_summary'
      })
        .sort({ createdAt: -1 })
        .lean();

      return notification;
    } catch (error) {
      console.error('Error getting latest weekly summary:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
