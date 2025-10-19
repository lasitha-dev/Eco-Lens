const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SustainabilityGoal',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['milestone_25', 'milestone_50', 'milestone_75', 'goal_achieved'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isCleared: {
    type: Boolean,
    default: false
  },
  metadata: {
    goalTitle: String,
    goalType: String,
    previousPercentage: Number,
    currentPercentage: Number
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  readAt: {
    type: Date
  },
  clearedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, isCleared: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, goalId: 1, type: 1 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
  }
};

// Method to clear notification
notificationSchema.methods.clearNotification = function() {
  this.isCleared = true;
  this.clearedAt = new Date();
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, isRead: false, isCleared: false });
};

// Static method to get active notifications for user
notificationSchema.statics.getActiveNotifications = function(userId, limit = 50) {
  return this.find({ userId, isCleared: false })
    .populate('goalId', 'title goalType')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to clear all notifications for user
notificationSchema.statics.clearAllForUser = function(userId) {
  return this.updateMany(
    { userId, isCleared: false },
    { $set: { isCleared: true, clearedAt: new Date() } }
  );
};

// Static method to check if notification already exists
notificationSchema.statics.notificationExists = function(userId, goalId, type) {
  return this.findOne({ userId, goalId, type });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
