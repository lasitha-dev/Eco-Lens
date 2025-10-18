import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://10.38.245.146:5002';

/**
 * Get auth token from AsyncStorage
 * @returns {Promise<string|null>}
 */
async function getAuthToken() {
  try {
    const token = await AsyncStorage.getItem('@eco_lens_token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Get user ID from AsyncStorage
 * @returns {Promise<string|null>}
 */
async function getUserId() {
  try {
    const userData = await AsyncStorage.getItem('@eco_lens_user');
    if (userData) {
      const user = JSON.parse(userData);
      return user._id || user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
}

/**
 * Fetch user notifications
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
export async function fetchNotifications(options = {}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const { limit = 20, skip = 0, type = null, isRead = null } = options;

    const queryParams = new URLSearchParams({
      limit: limit.toString(),
      skip: skip.toString(),
    });

    if (type) queryParams.append('type', type);
    if (isRead !== null) queryParams.append('isRead', isRead.toString());

    const response = await fetch(
      `${API_BASE_URL}/api/notifications?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Get unread notification count
 * @returns {Promise<number>}
 */
export async function fetchUnreadCount() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return 0;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notifications/unread-count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch unread count');
    }

    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }
}

/**
 * Get latest weekly summary
 * @returns {Promise<Object|null>}
 */
export async function fetchLatestWeeklySummary() {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notifications/latest-summary`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch latest summary');
    }

    const data = await response.json();
    return data.summary || null;
  } catch (error) {
    console.error('Error fetching latest summary:', error);
    return null;
  }
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>}
 */
export async function markNotificationAsRead(notificationId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<Object>}
 */
export async function markAllNotificationsAsRead() {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notifications/mark-all-read`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark all as read');
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>}
 */
export async function deleteNotification(notificationId) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

/**
 * Delete all notifications
 * @returns {Promise<Object>}
 */
export async function deleteAllNotifications() {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete all notifications');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}

/**
 * Update push token on server
 * @param {string} pushToken - Expo push token
 * @returns {Promise<Object>}
 */
export async function updatePushToken(pushToken) {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notifications/update-push-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, pushToken }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update push token');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating push token:', error);
    throw error;
  }
}

/**
 * Update weekly summary opt-in status
 * @param {boolean} optIn - Opt-in status
 * @returns {Promise<Object>}
 */
export async function updateWeeklySummaryOptIn(optIn) {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/opt-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, optIn }),
    });

    if (!response.ok) {
      throw new Error('Failed to update opt-in status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating opt-in status:', error);
    throw error;
  }
}

/**
 * Manually trigger weekly summary (for testing)
 * @returns {Promise<Object>}
 */
export async function triggerWeeklySummary() {
  try {
    const userId = await getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notifications/trigger-weekly`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to trigger weekly summary');
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering weekly summary:', error);
    throw error;
  }
}
