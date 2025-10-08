/**
 * ProfileScreen Component
 * User profile screen with account information and logout functionality
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  Image
} from 'react-native';
import { useAuth } from '../../hooks/useAuthLogin';
import theme from '../../styles/theme';
import globalStyles from '../../styles/globalStyles';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const {
    user,
    logout,
    getUserName,
    getUserEmail,
    getUserRole
  } = useAuth();

  // Get profile picture display logic
  const getProfilePicture = () => {
    if (user?.profilePicture) {
      // If it's base64, create data URI
      if (user.profilePicture.startsWith('/9j/') || user.profilePicture.length > 100) {
        return `data:image/jpeg;base64,${user.profilePicture}`;
      } else {
        return user.profilePicture;
      }
    }
    return null; // Will show default avatar
  };

  const [isLoggingOut, setIsLoggingOut] = useState(false);


  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: performLogout
        },
      ]
    );
  };

  // Perform the actual logout
  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Navigation will be handled automatically by the auth state change
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Profile menu items
  const profileMenuItems = [
    {
      id: 'account',
      title: 'Account Information',
      subtitle: 'View and edit your profile',
      icon: '👤',
      iconColor: '#4CAF50',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'orders',
      title: 'Order History',
      subtitle: 'View your past purchases',
      icon: '📦',
      iconColor: '#FF9800',
      onPress: () => navigation.navigate('OrderHistory'),
    },
    {
      id: 'sustainability',
      title: 'Sustainability Impact',
      subtitle: 'Track your eco-friendly choices',
      icon: '🌱',
      iconColor: '#66BB6A',
      onPress: () => Alert.alert('Coming Soon', 'Sustainability tracking will be available in a future update.'),
    },
  ];

  // Render profile menu item
  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.menuItemIcon, { backgroundColor: item.iconColor }]}>
        <Text style={styles.menuItemEmoji}>{item.icon}</Text>
      </View>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemTitle}>{item.title}</Text>
        <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={theme.colors.background}
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            {getProfilePicture() ? (
              <Image
                source={{ uri: getProfilePicture() }}
                style={styles.userAvatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.userAvatarText}>
                {getUserName() ? getUserName().charAt(0).toUpperCase() : 'N'}
              </Text>
            )}
          </View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {getUserName() || 'Namal Rajapakshe'}
            </Text>
            <Text style={styles.userEmail}>
              {getUserEmail() || 'lasithathulathmudalige98@gmail.com'}
            </Text>
            <View style={styles.userRoleBadge}>
              <Text style={styles.userRoleText}>Customer</Text>
            </View>
          </View>
        </View>

        {/* Profile Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <View style={styles.menuItems}>
            {profileMenuItems.map(renderMenuItem)}
          </View>
        </View>


        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={isLoggingOut}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  userAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  userAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  
  userRoleBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  
  userRoleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  menuSection: {
    marginBottom: 32,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  
  menuItems: {
    gap: 0,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  
  menuItemEmoji: {
    fontSize: 20,
  },
  
  menuItemContent: {
    flex: 1,
  },
  
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  
  menuItemSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 40,
  },
  
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
});

export default ProfileScreen;
