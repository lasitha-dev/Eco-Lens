import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get API URL with platform-specific logic for mobile vs web
const getApiUrl = () => {
  // Try to get from app.json extra configuration first
  if (Constants.expoConfig?.extra?.apiUrl) {
    const configUrl = Constants.expoConfig.extra.apiUrl;
    
    // If running on mobile device (not web), replace localhost with the manifest's debuggerHost IP
    if (Platform.OS !== 'web' && configUrl.includes('localhost')) {
      // Get the IP address from Expo's manifest (where the dev server is running)
      const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
      
      if (debuggerHost) {
        return configUrl.replace('localhost', debuggerHost);
      }
    }
    
    return configUrl;
  }
  
  // Fallback logic for development
  if (Platform.OS === 'web') {
    // Web can use localhost
    return 'http://localhost:5002/api';
  } else {
    // Mobile devices need the computer's IP address
    // Expo provides this through the debuggerHost
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':')[0];
    
    if (debuggerHost) {
      return `http://${debuggerHost}:5002/api`;
    }
    
    // Final fallback - use detected WiFi IP address
    console.warn('Could not auto-detect IP address from Expo. Using detected WiFi IP.');
    return 'http://10.38.245.146:5002/api'; // Your computer's WiFi IP address
  }
};

export const API_BASE_URL = getApiUrl();

// Debug logging to help troubleshoot connectivity issues
console.log('Platform:', Platform.OS);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Host URI:', Constants.expoConfig?.hostUri);

export default {
  API_BASE_URL,
};