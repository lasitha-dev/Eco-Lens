import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import theme from '../styles/theme';
import Button from '../components/ButtonLogin';
import Input from '../components/InputLogin';
import ProfileService from '../api/profileService';

const EditProfileScreen = ({ navigation, route }) => {
  const { profile } = route.params || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: `${profile.firstName} ${profile.lastName}`.trim(),
        email: profile.email || '',
        phone: profile.phone || '',
        gender: profile.gender || '',
        password: '',
      });
    }
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const showGenderPicker = () => {
    const options = ['Male', 'Female', 'Other', 'Prefer not to say', 'Cancel'];
    const values = ['male', 'female', 'other', 'prefer-not-to-say', null];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 4,
        },
        (buttonIndex) => {
          if (buttonIndex !== 4) {
            handleInputChange('gender', values[buttonIndex]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Gender',
        '',
        options.map((option, index) => ({
          text: option,
          onPress: () => {
            if (index !== 4) {
              handleInputChange('gender', values[index]);
            }
          },
          style: index === 4 ? 'cancel' : 'default',
        }))
      );
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (formData.password && formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      // Prepare data for API (only send changed fields)
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
      };

      // Only include password if it's not empty
      if (formData.password.trim()) {
        updateData.password = formData.password;
      }

      const updatedProfile = await ProfileService.updateProfile(updateData);

      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to profile screen with updated data
            navigation.navigate('MyProfile');
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <Input
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <Input
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <Input
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <TouchableOpacity style={styles.pickerContainer} onPress={showGenderPicker}>
              <Text style={styles.pickerText}>
                {formData.gender ? (
                  formData.gender === 'prefer-not-to-say' ? 'Prefer not to say' :
                  formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1)
                ) : 'Select Gender'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password (optional)</Text>
            <Input
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Leave blank to keep current password"
              secureTextEntry
            />
            <Text style={styles.hint}>
              Password must be at least 8 characters with uppercase, number, and special character
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {saving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={styles.savingText}>Saving...</Text>
            </View>
          ) : (
            <Button title="Save Changes" onPress={handleSave} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.m,
  },
  title: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    ...theme.shadows.small,
  },
  inputGroup: {
    marginBottom: theme.spacing.l,
  },
  label: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  hint: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.s,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.m,
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  savingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  savingText: {
    marginLeft: theme.spacing.s,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
  },
});

export default EditProfileScreen;