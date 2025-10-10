import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * OAuth Debugging Utility
 * Helps diagnose Google OAuth configuration issues
 */

/**
 * Extract tokens from OAuth redirect URL
 * @param {string} url - The redirect URL from OAuth
 * @returns {Object} Object containing idToken and accessToken if found
 */
export const extractTokensFromUrl = (url) => {
  try {
    console.log('Extracting tokens from URL:', url);
    
    if (!url) return { idToken: null, accessToken: null };
    
    // Parse the URL
    const urlObj = new URL(url);
    const hash = urlObj.hash.substring(1); // Remove the # at the beginning
    const hashParams = new URLSearchParams(hash);
    
    const idToken = hashParams.get('id_token');
    const accessToken = hashParams.get('access_token');
    
    console.log('Extracted tokens:', { idToken: !!idToken, accessToken: !!accessToken });
    
    return { idToken, accessToken };
  } catch (error) {
    console.error('Error extracting tokens from URL:', error);
    return { idToken: null, accessToken: null };
  }
};

export const debugOAuthConfig = () => {
  try {
    console.log('=== OAuth Configuration Debug ===');
    
    // Check environment variables
    const envVars = {
      EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
      EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
      EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS: Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    };
    
    console.log('Environment Variables:');
    Object.keys(envVars).forEach(key => {
      console.log(`  ${key}: ${envVars[key] ? 'SET' : 'NOT SET'}`);
      if (envVars[key]) {
        console.log(`    Value: ${envVars[key].substring(0, 70)}...`);
      }
    });
    
    // Check if running in Expo Go (handle case where Constants might not be fully loaded)
    let isExpoGo = false;
    try {
      isExpoGo = Constants.appOwnership === 'expo';
      console.log('Running in Expo Go:', isExpoGo);
    } catch (error) {
      console.log('Could not determine Expo Go status:', error.message);
    }
    
    // Check platform
    console.log('Platform:', Platform.OS);
    
    // Check if using fallback values
    const usingFallback = {
      web: !envVars.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
      android: !envVars.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
      ios: !envVars.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    };
    
    console.log('Using fallback values:', usingFallback);
    
    return {
      envVars,
      isExpoGo,
      platform: Platform.OS,
      usingFallback,
    };
  } catch (error) {
    console.error('Error in debugOAuthConfig:', error);
    return {
      error: error.message,
      envVars: {},
      isExpoGo: false,
      platform: Platform.OS || 'unknown',
      usingFallback: { web: true, android: true, ios: true },
    };
  }
};

export default { debugOAuthConfig, extractTokensFromUrl };