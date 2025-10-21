/**
 * Notification Service
 * Handles all notification-related API calls
 */

import { API_BASE_URL } from '../config/api';

class NotificationService {
  /**
   * Get authentication headers
   */
  static getAuthHeaders(token) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Get all notifications for the user
   */
  static async getNotifications(token, limit = 50, includeCleared = false) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications?limit=${limit}&includeCleared=${includeCleared}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notifications');
      }

      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: this.getAuthHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch unread count');
      }

      return data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(token, notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: 'PUT',
          headers: this.getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark notification as read');
      }

      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark all notifications as read');
      }

      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Clear a notification
   */
  static async clearNotification(token, notificationId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: 'DELETE',
          headers: this.getAuthHeaders(token),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear notification');
      }

      return data;
    } catch (error) {
      console.error('Error clearing notification:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications
   */
  static async clearAllNotifications(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clear all notifications');
      }

      return data;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }
}

export default NotificationService;
