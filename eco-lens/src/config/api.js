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
  
  // Fallback logic - use production URL
  return 'https://eco-lens-8bn1.onrender.com/api';
};

export const API_BASE_URL = getApiUrl();

// Debug logging to help troubleshoot connectivity issues
console.log('Platform:', Platform.OS);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('Host URI:', Constants.expoConfig?.hostUri);

export default {
  API_BASE_URL,
};