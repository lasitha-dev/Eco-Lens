import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register for push notifications and get Expo push token
 * @returns {Promise<string|null>} Expo push token or null
 */
export async function registerForPushNotificationsAsync() {
  let token = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId || 'your-project-id',
      })).data;
      console.log('Expo Push Token:', token);
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  // Android-specific channel configuration
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#34D399',
    });
  }

  return token;
}

/**
 * Update push token on the server
 * @param {string} userId - User ID
 * @param {string} pushToken - Expo push token
 * @param {string} baseUrl - API base URL
 * @returns {Promise<boolean>} Success status
 */
export async function updatePushTokenOnServer(userId, pushToken, baseUrl) {
  try {
    const response = await fetch(`${baseUrl}/api/notifications/update-push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        pushToken,
      }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating push token on server:', error);
    return false;
  }
}

/**
 * Schedule a local notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 * @param {number} seconds - Seconds until notification
 * @returns {Promise<string>} Notification ID
 */
export async function scheduleLocalNotification(title, body, data = {}, seconds = 0) {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: seconds > 0 ? { seconds } : null,
    });
    return id;
  } catch (error) {
    console.error('Error scheduling local notification:', error);
    throw error;
  }
}

/**
 * Cancel a scheduled notification
 * @param {string} notificationId - Notification ID
 */
export async function cancelScheduledNotification(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllScheduledNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Get notification badge count
 * @returns {Promise<number>} Badge count
 */
export async function getBadgeCount() {
  try {
    return await Notifications.getBadgeCountAsync();
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Set notification badge count
 * @param {number} count - Badge count
 */
export async function setBadgeCount(count) {
  try {
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error setting badge count:', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

/**
 * Add notification received listener
 * @param {Function} callback - Callback function
 * @returns {Object} Subscription object
 */
export function addNotificationReceivedListener(callback) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 * @param {Function} callback - Callback function
 * @returns {Object} Subscription object
 */
export function addNotificationResponseReceivedListener(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Remove notification subscription
 * @param {Object} subscription - Subscription object
 */
export function removeNotificationSubscription(subscription) {
  if (subscription) {
    subscription.remove();
  }
}
