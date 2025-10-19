/**
 * ScreenHeader - Reusable header component with notification bell
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import NotificationBell from '../NotificationBell';
import NotificationList from '../NotificationList';
import { LinearGradient } from 'expo-linear-gradient';

const ScreenHeader = ({
  title,
  subtitle,
  showBackButton = false,
  showNotifications = true,
  backgroundColor,
  gradient = ['#4CAF50', '#2E7D32'],
  textColor = '#FFFFFF',
  onBackPress,
  rightComponent,
}) => {
  const navigation = useNavigation();
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleNotificationPress = (notification) => {
    setNotificationModalVisible(false);
    
    // Navigate to goal progress if notification is related to a goal
    if (notification.goalId) {
      navigation.navigate('GoalProgress', {
        goalId: notification.goalId._id || notification.goalId,
      });
    }
  };

  const HeaderContent = () => (
    <View style={styles.headerContent}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: textColor }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: `${textColor}CC` }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right Section */}
      <View style={styles.rightSection}>
        {rightComponent}
        {showNotifications && (
          <NotificationBell
            onPress={() => setNotificationModalVisible(true)}
            iconColor={textColor}
            iconSize={24}
          />
        )}
      </View>
    </View>
  );

  return (
    <>
      {gradient && gradient.length > 0 ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <HeaderContent />
        </LinearGradient>
      ) : (
        <View style={[styles.header, backgroundColor && { backgroundColor }]}>
          <HeaderContent />
        </View>
      )}

      {/* Notification Modal */}
      <NotificationList
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
        onNotificationPress={handleNotificationPress}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
    opacity: 0.9,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ScreenHeader;
