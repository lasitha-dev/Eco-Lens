/**
 * NotificationContext - Global notification state management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../api/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Initialize token from AsyncStorage
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@eco_lens_token');
        if (storedToken) {
          setToken(storedToken);
          console.log('✅ Notification token loaded successfully');
        } else {
          console.log('⚠️ No auth token found for notifications');
        }
      } catch (error) {
        console.error('❌ Error loading token for notifications:', error);
      }
    };

    loadToken();
  }, []);

  /**
   * Fetch notifications from the server
   */
  const fetchNotifications = useCallback(async (forceRefresh = false) => {
    if (!token) {
      console.log('⚠️ Cannot fetch notifications: No token available');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📬 Fetching notifications from server...');
      const data = await NotificationService.getNotifications(token, 50, false);

      console.log(`✅ Fetched ${data.notifications?.length || 0} notifications, ${data.unreadCount || 0} unread`);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Fetch unread count only
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;

    try {
      const data = await NotificationService.getUnreadCount(token);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [token]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      await NotificationService.markAsRead(token, notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      // Decrease unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  }, [token]);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    if (!token) return;

    try {
      await NotificationService.markAllAsRead(token);

      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      throw err;
    }
  }, [token]);

  /**
   * Clear a notification
   */
  const clearNotification = useCallback(async (notificationId) => {
    if (!token) return;

    try {
      await NotificationService.clearNotification(token, notificationId);

      // Remove from local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));

      // Update unread count if notification was unread
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error clearing notification:', err);
      throw err;
    }
  }, [token, notifications]);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(async () => {
    if (!token) return;

    try {
      await NotificationService.clearAllNotifications(token);

      // Clear local state
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
      throw err;
    }
  }, [token]);

  /**
   * Refresh notifications periodically
   */
  useEffect(() => {
    if (token) {
      fetchNotifications();

      // Poll for new notifications every 30 seconds
      const intervalId = setInterval(() => {
        fetchUnreadCount();
      }, 30000);

      return () => clearInterval(intervalId);
    }
  }, [token, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
