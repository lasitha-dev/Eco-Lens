import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Get API URL from app.json configuration
const getApiUrl = () => {
  // Get from app.json extra configuration
  if (Constants.expoConfig?.extra?.apiUrl) {
    return Constants.expoConfig.extra.apiUrl;
  }
  
  // Fallback to production URL
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