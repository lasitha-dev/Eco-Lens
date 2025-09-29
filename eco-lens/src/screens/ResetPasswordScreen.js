import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { API_BASE_URL } from '../config/api';
import AuthService from '../api/authService';

const { width, height } = Dimensions.get('window');

const ResetPasswordScreen = ({ navigation, route }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState(route?.params?.token || '');
  const [loading, setLoading] = useState(false);
  const [tokenValidating, setTokenValidating] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [tokenFocused, setTokenFocused] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const initialToken = route?.params?.token || '';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous logo pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Validate token if provided
    if (initialToken) {
      setTokenValidating(true);
      validateToken(initialToken);
    } else {
      setTokenValidating(false);
      setTokenValid(false);
    }

    return () => pulseAnimation.stop();
  }, [initialToken]);

  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return hasUpperCase && hasNumber && hasSpecialChar && isLongEnough;
  };

  const validateToken = async (tokenToValidate = resetToken) => {
    if (!tokenToValidate) {
      setTokenValidating(false);
      setTokenValid(false);
      return;
    }

    try {
      setTokenValidating(true);
      await AuthService.verifyResetToken(tokenToValidate);
      setTokenValid(true);
      console.log('✅ Reset token is valid');
      // Small haptic feedback or visual indication that token is valid
    } catch (error) {
      console.error('Token validation error:', error);
      setTokenValid(false);
      Alert.alert(
        'Invalid Reset Code',
        error.message || 'This reset code is invalid or has expired. Please request a new password reset.',
        [{ text: 'OK' }]
      );
    } finally {
      setTokenValidating(false);
    }
  };

  // Auto-validate token when user enters it manually
  useEffect(() => {
    if (resetToken && resetToken.length > 10 && !initialToken) { // Only for manually entered tokens
      const timeoutId = setTimeout(() => {
        validateToken(resetToken);
      }, 500); // Debounce validation
      
      return () => clearTimeout(timeoutId);
    }
  }, [resetToken, initialToken]);

  const handleResetPassword = async () => {
    console.log('Button state check:', {
      resetToken: !!resetToken,
      tokenValid,
      newPassword: !!newPassword,
      confirmPassword: !!confirmPassword,
      loading
    });
    
    if (!resetToken.trim()) {
      Alert.alert('Missing Reset Code', 'Please enter your reset code.');
      return;
    }

    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing Information', 'Please fill in both password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match. Please try again.');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Invalid Password',
        'Password must contain uppercase letter, number, special character, and be at least 8 characters.'
      );
      return;
    }

    setLoading(true);

    // Success animation
    Animated.sequence([
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      // Call API to reset password
      const data = await AuthService.resetPassword(resetToken, newPassword);
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Unable to reset password. Please try again.',
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const logoRotateInterpolate = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Show loading screen while validating token
  if (tokenValidating) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <View style={styles.backgroundGradient}>
          <Animated.View style={[styles.backgroundCircle1, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.backgroundCircle2, { opacity: fadeAnim }]} />
        </View>
        <View style={[styles.keyboardView, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={[styles.subtitle, { marginTop: 16, textAlign: 'center' }]}>
            Validating reset link...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error screen if token is invalid and was provided initially
  if (initialToken && !tokenValidating && !tokenValid) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
        <View style={styles.backgroundGradient}>
          <Animated.View style={[styles.backgroundCircle1, { opacity: fadeAnim }]} />
          <Animated.View style={[styles.backgroundCircle2, { opacity: fadeAnim }]} />
        </View>
        <View style={[styles.keyboardView, { justifyContent: 'center', alignItems: 'center', padding: width * 0.06 }]}>
          <Text style={styles.logo}>❌</Text>
          <Text style={[styles.welcomeText, { textAlign: 'center', marginTop: 16 }]}>
            Invalid Reset Link
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 16 }]}>
            This password reset link is invalid or has expired. Please request a new one.
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, { marginTop: 32 }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      {/* Animated Background */}
      <View style={styles.backgroundGradient}>
        <Animated.View style={[styles.backgroundCircle1, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.backgroundCircle2, { opacity: fadeAnim }]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Logo and Welcome Section */}
          <Animated.View
            style={[
              styles.brandingSection,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: logoScale },
                  { scale: pulseAnim },
                  { rotate: logoRotateInterpolate }
                ]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Text style={styles.logo}>🌱</Text>
              </View>
              <View style={styles.logoGlow} />
            </View>
            <Animated.Text
              style={[
                styles.welcomeText,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              New Password
            </Animated.Text>
            <Animated.Text
              style={[
                styles.subtitle,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              {initialToken ? 'Enter your new password below' : 'Enter the reset code from your email and new password'}
            </Animated.Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Reset Token Input - Show if no initial token or token is invalid */}
            {(!initialToken || !tokenValid) && (
              <View style={styles.inputContainer}>
                <Animated.View style={[
                  styles.inputWrapper,
                  tokenFocused && styles.inputWrapperFocused,
                  resetToken && styles.inputWrapperFilled,
                  tokenValid && styles.inputWrapperValid
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>🔑</Text>
                  </View>
                  <View style={styles.inputContent}>
                    <Text style={[styles.inputLabel, tokenFocused && styles.inputLabelFocused]}>
                      Reset Code
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Enter reset code from email"
                      placeholderTextColor="#9E9E9E"
                      value={resetToken}
                      onChangeText={setResetToken}
                      onFocus={() => setTokenFocused(true)}
                      onBlur={() => setTokenFocused(false)}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {resetToken.length > 0 && (
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => validateToken(resetToken)}
                      activeOpacity={0.7}
                    >
                      {tokenValidating ? (
                        <ActivityIndicator size="small" color="#4CAF50" />
                      ) : tokenValid ? (
                        <Text style={[styles.eyeIcon, { color: '#4CAF50' }]}>✓</Text>
                      ) : (
                        <Text style={[styles.eyeIcon, { color: '#FF9800' }]}>⚠</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </Animated.View>
              </View>
            )}
            {/* Password fields - Only show if token is valid or no initial token was provided */}
            {(tokenValid || !initialToken) && (
              <>
                {/* New Password Input */}
                <View style={styles.inputContainer}>
                  <Animated.View style={[
                    styles.inputWrapper,
                    newPasswordFocused && styles.inputWrapperFocused,
                    newPassword && styles.inputWrapperFilled
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>🔐</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <Text style={[styles.inputLabel, newPasswordFocused && styles.inputLabelFocused]}>
                        New Password
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Enter new password"
                        placeholderTextColor="#9E9E9E"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        onFocus={() => setNewPasswordFocused(true)}
                        onBlur={() => setNewPasswordFocused(false)}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeIcon}>{showNewPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputContainer}>
                  <Animated.View style={[
                    styles.inputWrapper,
                    confirmPasswordFocused && styles.inputWrapperFocused,
                    confirmPassword && styles.inputWrapperFilled
                  ]}>
                    <View style={styles.inputIconContainer}>
                      <Text style={styles.inputIcon}>🔒</Text>
                    </View>
                    <View style={styles.inputContent}>
                      <Text style={[styles.inputLabel, confirmPasswordFocused && styles.inputLabelFocused]}>
                        Confirm Password
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Confirm new password"
                        placeholderTextColor="#9E9E9E"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setConfirmPasswordFocused(true)}
                        onBlur={() => setConfirmPasswordFocused(false)}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </>
            )}

            {/* Reset Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonLoading,
                (!newPassword || !confirmPassword || !resetToken || (resetToken && !tokenValid)) && styles.loginButtonDisabled
              ]}
              onPress={handleResetPassword}
              disabled={loading || !newPassword || !confirmPassword || !resetToken || (resetToken && !tokenValid)}
              activeOpacity={0.9}
            >
              <View style={styles.buttonContent}>
                {loading && (
                  <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIcon} />
                )}
                <Text style={styles.loginButtonText}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Text>
              </View>
              <View style={styles.buttonGlow} />
            </TouchableOpacity>
          </Animated.View>

          {/* Back to Login */}
          <Animated.View
            style={[
              styles.signUpSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpLink}>Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(132, 200, 137, 1)',
  },
  backgroundCircle1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#2E7D32',
    opacity: 0.3,
  },
  backgroundCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#388E3C',
    opacity: 0.2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.04,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: height * 0.06,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    fontSize: 48,
    textAlign: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#4CAF50',
    opacity: 0.2,
    borderRadius: 70,
    zIndex: -1,
  },
  welcomeText: {
    fontSize: Math.min(width * 0.09, 36),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#C8E6C9',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E8F5E8',
    borderRadius: 16,
    backgroundColor: '#F1F8E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 70,
  },
  inputWrapperFocused: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  inputWrapperFilled: {
    borderColor: '#81C784',
    backgroundColor: '#FFFFFF',
  },
  inputWrapperValid: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIcon: {
    fontSize: 20,
    opacity: 0.8,
  },
  inputContent: {
    flex: 1,
    marginLeft: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputLabelFocused: {
    color: '#0D4E12',
  },
  input: {
    fontSize: 16,
    color: '#0D4E12',
    fontWeight: '600',
    paddingVertical: 4,
  },
  eyeButton: {
    padding: 12,
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  loginButton: {
    position: 'relative',
    backgroundColor: '#4CAF50',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  loginButtonLoading: {
    backgroundColor: '#66BB6A',
  },
  loginButtonDisabled: {
    backgroundColor: '#C8E6C9',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginRight: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  signUpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#C8E6C9',
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default ResetPasswordScreen;