import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import AuthService from '../api/authService';

const { width, height } = Dimensions.get('window');

const EditProfileScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    dateOfBirth: '',
    country: '',
    profilePicture: null, // Will store base64 string for backend
  });

  const [displayImageUri, setDisplayImageUri] = useState(null); // For immediate display
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Load user profile data on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await AuthService.getUserProfile();
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        address: userData.address || '',
        dateOfBirth: userData.dateOfBirth || '',
        country: userData.country || '',
        profilePicture: userData.profilePicture || null,
      });

      // Set display image URI
      if (userData.profilePicture) {
        if (userData.profilePicture.startsWith('/9j/') || userData.profilePicture.length > 100) {
          // It's base64, create data URI
          setDisplayImageUri(`data:image/jpeg;base64,${userData.profilePicture}`);
        } else {
          // It's a URL
          setDisplayImageUri(userData.profilePicture);
        }
      } else {
        setDisplayImageUri(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile picture selection
  const pickImage = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Permission to access media library is required to select a profile picture.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() }
          ]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for profile pictures
        quality: 0.8, // Good quality but not too large
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;

        // Convert image to base64 for backend storage
        const base64 = await FileSystem.readAsStringAsync(selectedImageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Update formData with base64 string for backend
        updateFormData('profilePicture', base64);

        // Update display URI for immediate showing
        setDisplayImageUri(`data:image/jpeg;base64,${base64}`);

        // Show success feedback
        Alert.alert('Success', 'Profile picture selected successfully!');
      } else {
        // Image selection was cancelled
        console.log('Image selection cancelled');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', `Failed to select image: ${error.message}`);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic validation for required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      // Prepare data for update (exclude email as it shouldn't be changed)
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        address: formData.address.trim(),
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        profilePicture: formData.profilePicture, // Send base64 string to backend
      };

      // Call the API to update profile
      const updatedUser = await AuthService.updateProfile(updateData);

      // Reload profile data to ensure we have the latest from backend
      await loadUserProfile();

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <TouchableOpacity
              style={styles.profilePictureContainer}
              onPress={pickImage}
            >
              <Image
                source={
                  displayImageUri
                    ? { uri: displayImageUri }
                    : require('../../assets/icon.png') // Default placeholder
                }
                style={styles.profilePicture}
                resizeMode="cover"
              />
              {/* Camera icon overlay */}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraIconText}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.profilePictureHint}>
              Tap to change profile picture
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Enter your first name"
                value={formData.firstName}
                onChangeText={(value) => updateFormData('firstName', value)}
                autoCapitalize="words"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Enter your last name"
                value={formData.lastName}
                onChangeText={(value) => updateFormData('lastName', value)}
                autoCapitalize="words"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.readOnlyInput]}
                placeholder="Your email address"
                value={formData.email}
                editable={false}
                selectTextOnFocus={false}
              />
              <Text style={styles.hintText}>Email address cannot be changed</Text>
            </View>

            {/* Address */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={[styles.input, errors.address && styles.inputError]}
                placeholder="Enter your address"
                value={formData.address}
                onChangeText={(value) => updateFormData('address', value)}
                multiline
                numberOfLines={2}
              />
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* Date of Birth */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.dateOfBirth}
                onChangeText={(value) => updateFormData('dateOfBirth', value)}
              />
            </View>

            {/* Country */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Country</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your country"
                value={formData.country}
                onChangeText={(value) => updateFormData('country', value)}
                autoCapitalize="words"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: width * 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: height * 0.02,
    marginBottom: height * 0.04,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#2E7D32',
  },
  headerTitle: {
    fontSize: Math.min(width * 0.06, 24),
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  placeholder: {
    width: 40,
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  profilePictureContainer: {
    position: 'relative',
  },
  profilePicture: {
    width: Math.min(width * 0.35, 140), // Responsive size, max 140px
    height: Math.min(width * 0.35, 140),
    borderRadius: Math.min(width * 0.35, 140) / 2, // Perfect circle
    borderWidth: 4,
    borderColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  cameraIconText: {
    fontSize: 18,
  },
  profilePictureHint: {
    marginTop: 16,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontWeight: '500',
  },
  formSection: {
    paddingBottom: height * 0.05,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: Math.min(width * 0.04, 16),
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Math.min(height * 0.015, 12),
    fontSize: Math.min(width * 0.04, 16),
    backgroundColor: '#FAFAFA',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    color: '#666666',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: Math.min(width * 0.035, 14),
    marginTop: 4,
  },
  hintText: {
    fontSize: Math.min(width * 0.03, 12),
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: Math.min(height * 0.02, 16),
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default EditProfileScreen;
