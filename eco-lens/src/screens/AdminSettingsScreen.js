/**
 * AdminSettingsScreen
 * Settings screen for admin with biometric authentication toggle
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuthLogin';
import BiometricAuthService from '../services/BiometricAuthService';
import AuthService from '../api/authService';
import theme, { colors } from '../constants/theme';

const AdminSettingsScreen = ({ navigation }) => {
  const { user, getUserEmail } = useAuth();
  
  const [fingerprintEnabled, setFingerprintEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deviceSupported, setDeviceSupported] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');

  useEffect(() => {
    initializeBiometricSettings();
  }, []);

  const initializeBiometricSettings = async () => {
    try {
      setIsLoading(true);

      // Check device capabilities
      const supported = await BiometricAuthService.isDeviceSupported();
      setDeviceSupported(supported);

      if (supported) {
        const enrolled = await BiometricAuthService.isBiometricEnrolled();
        setBiometricEnrolled(enrolled);

        const type = await BiometricAuthService.getBiometricTypeName();
        setBiometricType(type);
      }

      // Get current setting from user object
      if (user?.fingerprintEnabled !== undefined) {
        setFingerprintEnabled(user.fingerprintEnabled);
      }

    } catch (error) {
      console.error('Error initializing biometric settings:', error);
      Alert.alert('Error', 'Failed to load biometric settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBiometric = async (value) => {
    // Prevent toggle if device not supported or biometric not enrolled
    if (!deviceSupported) {
      Alert.alert(
        'Not Supported',
        'Biometric authentication is not supported on this device.'
      );
      return;
    }

    if (!biometricEnrolled) {
      Alert.alert(
        'Setup Required',
        `Please set up ${biometricType} in your device settings first.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              // In a real app, you would open device settings here
              Alert.alert('Info', 'Please go to your device settings to set up biometric authentication.');
            }
          }
        ]
      );
      return;
    }

    if (value) {
      // Enabling biometric
      await enableBiometric();
    } else {
      // Disabling biometric
      await disableBiometric();
    }
  };

  const enableBiometric = async () => {
    try {
      setIsSaving(true);

      // Test biometric authentication first
      const authResult = await BiometricAuthService.authenticate(
        `Enable ${biometricType} for admin login`
      );

      if (!authResult.success) {
        Alert.alert('Authentication Failed', authResult.error);
        return;
      }

      // Save to backend using AuthService method
      await AuthService.updateFingerprintSetting(true);

      // Store credentials locally
      const email = getUserEmail();
      await BiometricAuthService.storeCredentialsForBiometric(email);
      
      setFingerprintEnabled(true);
      Alert.alert(
        'Success',
        `${biometricType} authentication has been enabled for your admin account.`
      );

    } catch (error) {
      console.error('Error enabling biometric:', error);
      Alert.alert('Error', error.message || 'Failed to enable biometric authentication. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const disableBiometric = async () => {
    Alert.alert(
      'Disable Biometric',
      `Are you sure you want to disable ${biometricType} authentication?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);

              // Save to backend using AuthService method
              await AuthService.updateFingerprintSetting(false);

              // Clear local credentials
              await BiometricAuthService.disableBiometric();
              
              setFingerprintEnabled(false);
              Alert.alert('Success', `${biometricType} authentication has been disabled.`);

            } catch (error) {
              console.error('Error disabling biometric:', error);
              Alert.alert('Error', error.message || 'Failed to disable biometric authentication. Please try again.');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const renderBiometricSection = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={styles.settingIconContainer}>
              <Text style={styles.settingIcon}>🔐</Text>
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>{biometricType} Login</Text>
              <Text style={styles.settingDescription}>
                {deviceSupported
                  ? biometricEnrolled
                    ? `Use ${biometricType} to quickly access your admin dashboard`
                    : `Set up ${biometricType} in device settings to enable this feature`
                  : 'Not supported on this device'}
              </Text>
            </View>
          </View>
          <Switch
            value={fingerprintEnabled}
            onValueChange={handleToggleBiometric}
            disabled={isSaving || !deviceSupported || !biometricEnrolled}
            trackColor={{ false: '#E0E0E0', true: colors.primary }}
            thumbColor={fingerprintEnabled ? '#FFFFFF' : '#F4F4F4'}
            ios_backgroundColor="#E0E0E0"
          />
        </View>

        {fingerprintEnabled && (
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              After entering your credentials, you'll be prompted to use {biometricType} before accessing the admin dashboard.
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpace} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderBiometricSection()}

        {/* Device Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform:</Text>
            <Text style={styles.infoValue}>{Platform.OS === 'ios' ? 'iOS' : 'Android'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Biometric Support:</Text>
            <Text style={[styles.infoValue, { color: deviceSupported ? colors.success : colors.error }]}>
              {deviceSupported ? 'Yes' : 'No'}
            </Text>
          </View>
          
          {deviceSupported && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Biometric Type:</Text>
              <Text style={styles.infoValue}>{biometricType}</Text>
            </View>
          )}
          
          {deviceSupported && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Biometric Enrolled:</Text>
              <Text style={[styles.infoValue, { color: biometricEnrolled ? colors.success : colors.error }]}>
                {biometricEnrolled ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpace: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  settingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingIcon: {
    fontSize: 24,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
});

export default AdminSettingsScreen;
