const Notification = require('../models/Notification');

/**
 * Notification Helper Utility
 * Handles creation of notifications for goal progress milestones
 */

class NotificationHelper {
  /**
   * Check and create notifications based on goal progress
   * @param {Object} goal - The sustainability goal
   * @param {Number} previousPercentage - Previous progress percentage
   * @param {Number} currentPercentage - Current progress percentage
   */
  static async checkAndCreateMilestoneNotifications(goal, previousPercentage, currentPercentage) {
    if (!goal || !goal.userId) return;

    const milestones = [
      { threshold: 25, type: 'milestone_25', emoji: '🌱', message: 'Great start!' },
      { threshold: 50, type: 'milestone_50', emoji: '🌿', message: 'Halfway there!' },
      { threshold: 75, type: 'milestone_75', emoji: '🌳', message: 'Almost there!' },
      { threshold: goal.goalConfig?.percentage || 100, type: 'goal_achieved', emoji: '🎉', message: 'Goal achieved!' }
    ];

    const notifications = [];

    for (const milestone of milestones) {
      // Check if this milestone was just crossed
      if (previousPercentage < milestone.threshold && currentPercentage >= milestone.threshold) {
        // Check if notification already exists to avoid duplicates
        const existingNotification = await Notification.notificationExists(
          goal.userId,
          goal._id,
          milestone.type
        );

        if (!existingNotification) {
          const notification = await this.createMilestoneNotification(
            goal,
            milestone.type,
            milestone.threshold,
            milestone.emoji,
            milestone.message,
            previousPercentage,
            currentPercentage
          );
          
          if (notification) {
            notifications.push(notification);
          }
        }
      }
    }

    return notifications;
  }

  /**
   * Create a milestone notification
   */
  static async createMilestoneNotification(goal, type, percentage, emoji, customMessage, prevPercentage, currPercentage) {
    try {
      const notificationData = {
        userId: goal.userId,
        goalId: goal._id,
        type,
        percentage,
        metadata: {
          goalTitle: goal.title,
          goalType: goal.goalType,
          previousPercentage: Math.round(prevPercentage * 10) / 10,
          currentPercentage: Math.round(currPercentage * 10) / 10
        }
      };

      // Customize title and message based on milestone type
      switch (type) {
        case 'milestone_25':
          notificationData.title = `${emoji} 25% Progress Milestone!`;
          notificationData.message = `${customMessage} You've reached 25% progress on "${goal.title}". Keep up the sustainable shopping!`;
          break;
        
        case 'milestone_50':
          notificationData.title = `${emoji} 50% Progress Milestone!`;
          notificationData.message = `${customMessage} You're halfway to achieving "${goal.title}". You're doing amazing!`;
          break;
        
        case 'milestone_75':
          notificationData.title = `${emoji} 75% Progress Milestone!`;
          notificationData.message = `${customMessage} You're 75% of the way to "${goal.title}". Just a little more to go!`;
          break;
        
        case 'goal_achieved':
          notificationData.title = `${emoji} Goal Achieved!`;
          notificationData.message = `Congratulations! You've achieved your sustainability goal: "${goal.title}". Amazing work on making sustainable choices!`;
          break;
        
        default:
          notificationData.title = `Progress Update`;
          notificationData.message = `You've made progress on "${goal.title}"`;
      }

      const notification = new Notification(notificationData);
      await notification.save();

      console.log(`✅ Created notification: ${type} for goal ${goal._id}`);
      return notification;
    } catch (error) {
      console.error('❌ Error creating milestone notification:', error);
      return null;
    }
  }

  /**
   * Create a custom notification
   */
  static async createCustomNotification(userId, goalId, title, message, type = 'custom') {
    try {
      const notification = new Notification({
        userId,
        goalId,
        type,
        title,
        message,
        percentage: 0
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('❌ Error creating custom notification:', error);
      return null;
    }
  }

  /**
   * Clean up old notifications (optional maintenance function)
   */
  static async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await Notification.deleteMany({
        isCleared: true,
        clearedAt: { $lt: cutoffDate }
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up notifications:', error);
      return 0;
    }
  }
}

module.exports = NotificationHelper;
