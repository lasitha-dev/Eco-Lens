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
import AuthService from '../api/authService';
import { API_BASE_URL } from '../config/api';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

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

    return () => pulseAnimation.stop();
  }, []);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
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
      // Call API to request password reset
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      const data = await response.json();
      Alert.alert(
        'Reset Email Sent',
        data.message || 'If this email is registered, a reset link has been sent. Please check your inbox or spam folder.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Unable to send reset email. Please try again.',
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
              Reset Password
            </Animated.Text>
            <Animated.Text
              style={[
                styles.subtitle,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              Enter your email to receive a reset link
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
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Animated.View style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
                email && styles.inputWrapperFilled
              ]}>
                <View style={styles.inputIconContainer}>
                  <Text style={styles.inputIcon}>✉️</Text>
                </View>
                <View style={styles.inputContent}>
                  <Text style={[styles.inputLabel, emailFocused && styles.inputLabelFocused]}>
                    Email Address
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9E9E9E"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                  />
                </View>
              </Animated.View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonLoading,
                !email && styles.loginButtonDisabled
              ]}
              onPress={handleForgotPassword}
              disabled={loading || !email}
              activeOpacity={0.9}
            >
              <View style={styles.buttonContent}>
                {loading && (
                  <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIcon} />
                )}
                <Text style={styles.loginButtonText}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
            <Text style={styles.signUpText}>Remember your password? </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
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

export default ForgotPasswordScreen;