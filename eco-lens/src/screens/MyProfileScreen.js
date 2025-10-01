import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import theme from '../styles/theme';
import Button from '../components/ButtonLogin';
import ProfileService from '../api/profileService';
import { useAuth } from '../hooks/useAuthLogin';

const MyProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { setAuth } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await ProfileService.getProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Profile load error:', error);
      // Alert.alert('Error', 'Failed to load profile'); // Commented out to avoid web refresh issues
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await setAuth(null);
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const maskPassword = () => {
    return '••••••••';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <View style={styles.center}>
            <Text style={styles.errorText}>Failed to load profile</Text>
            <Button title="Retry" onPress={loadProfile} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile', { profile: null })}>
              <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {/* Profile Picture */}
        <View style={styles.profileIconContainer}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileInitials}>
              {getInitials(profile.firstName, profile.lastName)}
            </Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{`${profile.firstName} ${profile.lastName}`}</Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.m,
  },
  backButton: {
    paddingVertical: theme.spacing.s,
  },
  backText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  content: {
    flex: 1,
    padding: theme.spacing.m,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.error,
    marginBottom: theme.spacing.m,
  },
  profileIconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  profileInitials: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textOnPrimary,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  name: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  editButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  editButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
  },
  logoutButton: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

export default MyProfileScreen;