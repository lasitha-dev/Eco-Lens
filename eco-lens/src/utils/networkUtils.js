import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';

/**
 * Test network connectivity to the backend API
 * @returns {Promise<boolean>} - Returns true if connection is successful
 */
export const testApiConnection = async () => {
  try {
    console.log(`Testing API connection to: ${API_BASE_URL}/health`);
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      timeout: 5000, // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('API connection successful:', data);
      return true;
    } else {
      console.error('API returned error status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('API connection failed:', error.message);
    return false;
  }
};

/**
 * Get troubleshooting information for network issues
 * @returns {object} - Debugging information
 */
export const getNetworkDebugInfo = () => {
  return {
    platform: Platform.OS,
    apiBaseUrl: API_BASE_URL,
    timestamp: new Date().toISOString(),
    userAgent: Platform.OS === 'web' ? navigator.userAgent : 'React Native App'
  };
};

/**
 * Show network troubleshooting tips based on platform
 */
export const showNetworkTroubleshootingTips = () => {
  const tips = {
    ios: [
      'Make sure your iPhone and computer are on the same WiFi network',
      'Check if your computer\'s firewall is blocking port 5002',
      'Try restarting the Expo development server',
    ],
    android: [
      'Ensure your Android device and computer are on the same WiFi network',
      'Check if your computer\'s firewall allows incoming connections on port 5002',
      'Try using your computer\'s actual IP address instead of localhost',
    ],
    web: [
      'Check if the backend server is running on port 5002',
      'Verify the backend URL is correct',
      'Check browser console for CORS errors',
    ]
  };
  
  return tips[Platform.OS] || tips.android;
};