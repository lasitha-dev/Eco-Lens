/**
 * BiometricAuthService
 * Handles biometric authentication (fingerprint, Face ID, etc.)
 */

import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';

class BiometricAuthService {
  // Storage keys
  static BIOMETRIC_CREDENTIALS_KEY = '@eco_lens_biometric_credentials';
  static BIOMETRIC_ENABLED_KEY = '@eco_lens_biometric_enabled';

  /**
   * Check if device supports biometric authentication
   */
  static async isDeviceSupported() {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      return compatible;
    } catch (error) {
      console.error('Error checking biometric hardware:', error);
      return false;
    }
  }

  /**
   * Check if user has enrolled biometrics on their device
   */
  static async isBiometricEnrolled() {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error('Error checking biometric enrollment:', error);
      return false;
    }
  }

  /**
   * Get available biometric types on the device
   */
  static async getSupportedBiometricTypes() {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return types;
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  }

  /**
   * Get biometric type name for display
   */
  static async getBiometricTypeName() {
    const types = await this.getSupportedBiometricTypes();
    
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Fingerprint';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Recognition';
    }
    
    return 'Biometric';
  }

  /**
   * Authenticate user with biometrics
   */
  static async authenticate(promptMessage) {
    try {
      // Check if device supports biometrics
      const isSupported = await this.isDeviceSupported();
      if (!isSupported) {
        return {
          success: false,
          error: 'Biometric authentication is not supported on this device'
        };
      }

      // Check if biometrics are enrolled
      const isEnrolled = await this.isBiometricEnrolled();
      if (!isEnrolled) {
        return {
          success: false,
          error: 'No biometrics enrolled on this device. Please set up biometric authentication in your device settings.'
        };
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Authenticate to continue',
        fallbackLabel: 'Use Password',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel'
      });

      if (result.success) {
        return {
          success: true,
          error: null
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'An error occurred during authentication'
      };
    }
  }

  /**
   * Store credentials for biometric authentication
   * Note: In production, use secure storage like expo-secure-store
   */
  static async storeCredentialsForBiometric(email) {
    try {
      await AsyncStorage.setItem(this.BIOMETRIC_CREDENTIALS_KEY, JSON.stringify({ email }));
      return true;
    } catch (error) {
      console.error('Error storing biometric credentials:', error);
      return false;
    }
  }

  /**
   * Get stored credentials for biometric authentication
   */
  static async getStoredCredentials() {
    try {
      const credentialsJson = await AsyncStorage.getItem(this.BIOMETRIC_CREDENTIALS_KEY);
      if (credentialsJson) {
        return JSON.parse(credentialsJson);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored credentials:', error);
      return null;
    }
  }

  /**
   * Clear stored biometric credentials
   */
  static async clearStoredCredentials() {
    try {
      await AsyncStorage.removeItem(this.BIOMETRIC_CREDENTIALS_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing biometric credentials:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication for user
   */
  static async enableBiometric(email) {
    try {
      // Check device support
      const isSupported = await this.isDeviceSupported();
      if (!isSupported) {
        Alert.alert(
          'Not Supported',
          'Biometric authentication is not supported on this device.'
        );
        return false;
      }

      // Check enrollment
      const isEnrolled = await this.isBiometricEnrolled();
      if (!isEnrolled) {
        Alert.alert(
          'Setup Required',
          'Please set up biometric authentication in your device settings first.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // Open iOS settings
                  // Linking.openURL('app-settings:');
                } else {
                  // Open Android settings
                  // Linking.openSettings();
                }
              }
            }
          ]
        );
        return false;
      }

      // Test authentication
      const biometricType = await this.getBiometricTypeName();
      const authResult = await this.authenticate(`Enable ${biometricType} for admin login`);
      
      if (authResult.success) {
        // Store credentials
        await this.storeCredentialsForBiometric(email);
        await AsyncStorage.setItem(this.BIOMETRIC_ENABLED_KEY, 'true');
        return true;
      } else {
        Alert.alert('Authentication Failed', authResult.error);
        return false;
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      Alert.alert('Error', 'Failed to enable biometric authentication');
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  static async disableBiometric() {
    try {
      await this.clearStoredCredentials();
      await AsyncStorage.removeItem(this.BIOMETRIC_ENABLED_KEY);
      return true;
    } catch (error) {
      console.error('Error disabling biometric:', error);
      return false;
    }
  }

  /**
   * Check if biometric is enabled locally
   */
  static async isBiometricEnabledLocally() {
    try {
      const enabled = await AsyncStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  }

  /**
   * Verify biometric and return stored email
   */
  static async authenticateAndGetEmail(promptMessage) {
    try {
      const authResult = await this.authenticate(promptMessage);
      
      if (authResult.success) {
        const credentials = await this.getStoredCredentials();
        return {
          success: true,
          email: credentials?.email || null
        };
      }
      
      return {
        success: false,
        error: authResult.error
      };
    } catch (error) {
      console.error('Error in authenticateAndGetEmail:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default BiometricAuthService;
