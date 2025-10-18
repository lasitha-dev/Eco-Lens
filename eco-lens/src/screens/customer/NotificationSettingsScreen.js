import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateWeeklySummaryOptIn, triggerWeeklySummary } from '../../api/notificationService';

/**
 * NotificationSettingsScreen Component
 * Allows users to manage their notification preferences
 */
const NotificationSettingsScreen = ({ navigation }) => {
  const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * Load user preferences
   */
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setWeeklySummaryEnabled(user.weeklySummaryOptIn !== false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle toggle weekly summary
   */
  const handleToggleWeeklySummary = async (value) => {
    setSaving(true);
    try {
      const result = await updateWeeklySummaryOptIn(value);
      if (result.success) {
        setWeeklySummaryEnabled(value);
        
        // Update local storage
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          user.weeklySummaryOptIn = value;
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }

        Alert.alert(
          'Success',
          `Weekly summaries ${value ? 'enabled' : 'disabled'} successfully`
        );
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      Alert.alert('Error', 'Failed to update preference');
      setWeeklySummaryEnabled(!value); // Revert on error
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle test notification
   */
  const handleTestNotification = async () => {
    Alert.alert(
      'Test Weekly Summary',
      'This will generate a test weekly summary notification based on your recent activity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Test',
          onPress: async () => {
            try {
              setSaving(true);
              const result = await triggerWeeklySummary();
              if (result.success) {
                Alert.alert(
                  'Success',
                  'Test notification sent! Check your notifications.'
                );
              }
            } catch (error) {
              console.error('Error sending test notification:', error);
              Alert.alert('Error', 'Failed to send test notification');
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#34D399" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Notification Settings</Text>
            <Text style={styles.headerSubtitle}>
              Manage your alerts
            </Text>
          </View>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color="#34A853" style={styles.infoBannerIcon} />
          <Text style={styles.infoBannerText}>
            Manage how and when you receive notifications about your sustainability goals.
          </Text>
        </View>

        {/* Weekly Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Summary</Text>
          <View style={styles.settingCard}>
            <View style={styles.settingIconContainer}>
              <Ionicons name="calendar" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Progress Summary</Text>
              <Text style={styles.settingDescription}>
                Receive a summary of your sustainability progress every Sunday morning
              </Text>
            </View>
            <Switch
              value={weeklySummaryEnabled}
              onValueChange={handleToggleWeeklySummary}
              trackColor={{ false: '#E5E7EB', true: '#34D399' }}
              thumbColor={weeklySummaryEnabled ? '#FFFFFF' : '#F3F4F6'}
              disabled={saving}
            />
          </View>
          <Text style={styles.scheduleText}>⏰ Scheduled for every Sunday at 9:00 AM</Text>
        </View>

        {/* Real-time Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Real-time Notifications</Text>
          <View style={styles.settingCard}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#34A853' }]}>
              <Ionicons name="trophy" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Goal Achievements</Text>
              <Text style={styles.settingDescription}>
                Get notified when you complete a sustainability goal
              </Text>
            </View>
          </View>
          <View style={styles.alwaysOnBadge}>
            <Text style={styles.alwaysOnText}>Always On</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#34A853',
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
  },
  section: {
    marginTop: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34A853',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  scheduleText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 12,
  },
  infoBanner: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#34A853',
  },
  infoBannerIcon: {
    marginRight: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#34A853',
    lineHeight: 20,
  },
  alwaysOnBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  alwaysOnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34A853',
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    padding: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  testButtonContent: {
    flex: 1,
  },
  testButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  testButtonDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoSection: {
    marginTop: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 0,
    marginHorizontal: 0,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoList: {
    marginBottom: 12,
  },
  infoListItem: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 24,
  },
  infoFooter: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default NotificationSettingsScreen;