/**
 * Authentication Test Utility
 * Helps debug authentication issues
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const testAuthToken = async () => {
  try {
    console.log('🔍 Testing authentication...');
    
    // Check if AsyncStorage is available
    console.log('AsyncStorage available:', !!AsyncStorage);
    
    // Get all keys
    const keys = await AsyncStorage.getAllKeys();
    console.log('All AsyncStorage keys:', keys);
    
    // Check for auth token (try both possible keys)
    let authToken = await AsyncStorage.getItem('@eco_lens_auth_token');
    if (!authToken) {
      authToken = await AsyncStorage.getItem('@eco_lens_token');
    }
    console.log('Auth token present:', !!authToken);
    console.log('Auth token length:', authToken ? authToken.length : 0);
    console.log('Auth token preview:', authToken ? authToken.substring(0, 20) + '...' : 'null');
    
    // Check for user data (try both possible keys)
    let userData = await AsyncStorage.getItem('@eco_lens_user_data');
    if (!userData) {
      userData = await AsyncStorage.getItem('@eco_lens_user');
    }
    console.log('User data present:', !!userData);
    
    if (userData) {
      const user = JSON.parse(userData);
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
    }
    
    return {
      hasAuthToken: !!authToken,
      hasUserData: !!userData,
      authTokenLength: authToken ? authToken.length : 0
    };
  } catch (error) {
    console.error('Error testing auth:', error);
    return {
      hasAuthToken: false,
      hasUserData: false,
      error: error.message
    };
  }
};

export const clearAuthData = async () => {
  try {
    // Clear both possible keys
    await AsyncStorage.removeItem('@eco_lens_auth_token');
    await AsyncStorage.removeItem('@eco_lens_token');
    await AsyncStorage.removeItem('@eco_lens_user_data');
    await AsyncStorage.removeItem('@eco_lens_user');
    console.log('✅ Auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};
