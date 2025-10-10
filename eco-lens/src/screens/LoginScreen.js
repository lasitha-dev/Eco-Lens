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
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AuthService from '../api/authService';
import SurveyService from '../api/surveyService';
import { useAuth } from '../hooks/useAuthLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/api';
import Constants from 'expo-constants';
import oauthDebug from '../utils/oauthDebug';

// Extract the functions from the default import
const { debugOAuthConfig, extractTokensFromUrl } = oauthDebug;

// Test imports
console.log('=== LoginScreen Imports ===');
console.log('Constants available:', !!Constants);
console.log('Platform:', Platform.OS || 'Not available');

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [oauthReady, setOauthReady] = useState(false);
  const { setAuth } = useAuth();

  // Debug OAuth configuration
  useEffect(() => {
    const debugInfo = debugOAuthConfig();
    console.log('OAuth Debug Info:', debugInfo);
    
    // Check if OAuth is properly configured
    const isConfigured = !!(debugInfo.envVars.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || 
                           debugInfo.envVars.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || 
                           debugInfo.envVars.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS);
    
    setOauthReady(isConfigured);
  }, []);

  // Check if environment variables are properly set, with fallbacks
  const googleWebClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB || '782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com';
  const googleAndroidClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || '782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com';
  const googleIosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || '782129521115-uc9bfcece12ittq4kef77f9fjhe3d332.apps.googleusercontent.com';

  useEffect(() => {
    // Log environment variables for debugging (remove in production)
    console.log('Google OAuth Environment Variables:');
    console.log('Web Client ID:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB ? 'SET' : 'NOT SET (using fallback)');
    console.log('Android Client ID:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID ? 'SET' : 'NOT SET (using fallback)');
    console.log('iOS Client ID:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS ? 'SET' : 'NOT SET');
    
    // Warn if critical environment variables are missing
    if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB) {
      console.warn('EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB is not set! Using fallback value.');
    }
    if (!process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID) {
      console.warn('EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID is not set! Using fallback value.');
    }
  }, []);

  // Create auth request config based on the current platform
  const getAuthConfig = () => {
    // Use Web Client ID for all platforms
    const config = {
      clientId: googleWebClientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: 'id_token',
    };
    
    // Platform-specific redirect configuration
    if (Platform.OS === 'web') {
      config.redirectUri = 'http://localhost:8081';
      config.useProxy = false;
    } else {
      // For mobile, explicitly set the Expo auth proxy redirect URI
      // Format: https://auth.expo.io/@USERNAME/SLUG
      const expoUsername = 'coder_lasitha';
      const appSlug = Constants.expoConfig?.slug || 'eco-lens';
      config.redirectUri = `https://auth.expo.io/@${expoUsername}/${appSlug}`;
      config.useProxy = true;
      
      console.log('Using Expo auth proxy redirect:', config.redirectUri);
    }
    
    console.log('OAuth Config:', {
      platform: Platform.OS,
      clientId: config.clientId.substring(0, 20) + '...',
      redirectUri: config.redirectUri,
      useProxy: config.useProxy
    });
    
    return config;
  };

  const authConfig = getAuthConfig();
  const [request, response, promptAsync] = Google.useAuthRequest(authConfig);

  // Log the config for debugging
  useEffect(() => {
    console.log('=== GOOGLE AUTH CONFIGURATION ===');
    console.log('Platform:', Platform.OS);
    console.log('Config:', JSON.stringify(authConfig, null, 2));
    console.log('================================');
    
    // Log the redirect URI that Expo AuthSession will use
    if (request) {
      console.log('✅ Expo AuthSession redirect URI:', request.redirectUri);
      console.log('📋 ADD THIS TO GOOGLE CLOUD CONSOLE:', request.redirectUri);
      console.log('================================');
    }
  }, [request, authConfig]);

  // Log the request for debugging
  useEffect(() => {
    console.log('Google Auth Request initialized:', !!request);
    if (request) {
      console.log('Discovery document:', request);
      console.log('Redirect URI from request:', request.redirectUri);
    }
  }, [request]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('Google Auth Response updated:', response);
    if (response?.type === 'success') {
      const { authentication, url } = response;
      console.log('Google Auth Success - Authentication object:', !!authentication);
      console.log('Response URL:', url);
      
      // Log the full response for debugging
      console.log('Full response object:', JSON.stringify(response, null, 2));
      
      // Try multiple methods to get the ID token
      let idToken = null;
      
      // Method 1: Check if it's in the authentication object
      if (authentication?.idToken) {
        console.log('ID Token found in authentication object');
        idToken = authentication.idToken;
      }
      // Method 2: Extract from URL using our utility function
      else if (url) {
        console.log('Attempting to extract token from URL using utility function...');
        const { idToken: extractedIdToken } = extractTokensFromUrl(url);
        if (extractedIdToken) {
          console.log('Successfully extracted ID Token from URL');
          idToken = extractedIdToken;
        } else {
          console.log('No ID token found in URL');
        }
      }
      
      // If we have an ID token, use it
      if (idToken) {
        console.log('Calling handleGoogleSignIn with ID token');
        handleGoogleSignIn(idToken);
      }
      // Fallback to access token if ID token is not available
      else if (authentication?.accessToken) {
        console.log('Access Token present, but ID Token is missing');
        console.log('This might be a configuration issue with Google OAuth');
        handleGoogleSignInWithAccessToken(authentication.accessToken);
      } else {
        console.log('No ID token or access token available');
        Alert.alert(
          'Google Sign-In Error', 
          'Failed to get authentication token from Google. This might be due to OAuth configuration issues.'
        );
        setLoading(false);
      }
    } else if (response?.type === 'error') {
      console.log('Google Sign-In error:', response.error);
      setLoading(false);
      Alert.alert('Google Sign-In Error', response.error?.message || 'An error occurred during Google sign-in');
    } else if (response?.type === 'dismiss') {
      console.log('Google Sign-In dismissed');
      setLoading(false);
    }
  }, [response]);

  const handleGoogleSignIn = async (idToken) => {
    setLoading(true);
    try {
      console.log('Attempting Google login with ID token');
      const result = await AuthService.googleLogin(idToken);
      console.log('Google login successful:', result);
      await setAuth(result);
      
      if (result.user.role === 'admin') {
        navigation.navigate('AdminDashboard');
      } else {
        try {
          const surveyStatus = await SurveyService.checkSurveyStatus(result.user.id, result.token);
          if (!surveyStatus.completed) {
            navigation.navigate('OnboardingSurvey');
          } else {
            navigation.navigate('Dashboard');
          }
        } catch (surveyError) {
          console.error('Error checking survey status:', surveyError);
          navigation.navigate('Dashboard');
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      Alert.alert(
        'Google Sign-In Failed', 
        error.message || 'An error occurred during Google sign-in. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Fallback method to handle access token
  const handleGoogleSignInWithAccessToken = async (accessToken) => {
    setLoading(true);
    try {
      console.log('Attempting to get user info with access token');
      
      // Try to get user info from Google API using access token
      const userInfoResponse = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
      );
      
      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info from Google');
      }
      
      const userInfo = await userInfoResponse.json();
      console.log('User info from Google:', userInfo);
      
      // Create a custom ID token-like object for our backend
      // Note: This is not a real ID token, but we can extract the needed info
      const fakeIdToken = btoa(JSON.stringify({
        iss: 'https://accounts.google.com',
        sub: userInfo.sub,
        aud: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        email: userInfo.email,
        email_verified: userInfo.email_verified,
        name: userInfo.name,
        given_name: userInfo.given_name,
        family_name: userInfo.family_name,
        picture: userInfo.picture
      }));
      
      console.log('Created fake ID token, calling handleGoogleSignIn');
      await handleGoogleSignIn(fakeIdToken);
    } catch (error) {
      console.error('Error getting user info with access token:', error);
      Alert.alert(
        'Google Sign-In Failed', 
        'Failed to authenticate with Google. Please try again.'
      );
      setLoading(false);
    }
  };

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

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Information', 'Please enter both email and password to continue.');
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
      const result = await AuthService.loginUser(email, password);
      console.log('Login successful:', result);
      
      // Set auth context with the result
      await setAuth(result);
      
      // Navigate based on user role
      if (result.user.role === 'admin') {
        console.log('✅ Admin login - redirecting to AdminDashboard');
        navigation.navigate('AdminDashboard');
      } else {
        // Check if customer has completed or skipped the survey
        try {
          // First check if user has completed or skipped the survey locally
          const surveyCompleted = await AsyncStorage.getItem('@eco_lens_survey_completed');
          const surveySkipped = await AsyncStorage.getItem('@eco_lens_survey_skipped');
          
          if (surveyCompleted === 'true') {
            console.log('✅ Customer login - survey was completed, redirecting to Dashboard');
            navigation.navigate('Dashboard');
            return;
          }
          
          if (surveySkipped === 'true') {
            console.log('✅ Customer login - survey was skipped, redirecting to Dashboard');
            navigation.navigate('Dashboard');
            return;
          }

          // Check survey completion status from server
          const surveyStatus = await SurveyService.checkSurveyStatus(result.user.id, result.token);
          console.log('Survey status:', surveyStatus);
          
          if (!surveyStatus.completed) {
            console.log('✅ Customer login - redirecting to OnboardingSurvey');
            navigation.navigate('OnboardingSurvey');
          } else {
            console.log('✅ Customer login - redirecting to Dashboard');
            navigation.navigate('Dashboard');
          }
        } catch (error) {
          console.error('Error checking survey status:', error);
          // If survey check fails, go to dashboard
          navigation.navigate('Dashboard');
        }
      }
    } catch (error) {
      Alert.alert(
        'Login Failed', 
        error.message || 'Unable to sign in. Please check your credentials and try again.',
        [{ text: 'Try Again', style: 'default' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleGoogleLogin = async () => {
    console.log('=== INITIATING GOOGLE LOGIN ===');
    console.log('Platform:', Platform.OS);
    console.log('Current request state:', !!request);
    console.log('Auth config being used:', JSON.stringify(authConfig, null, 2));
    console.log('===============================');
    
    // Log the redirect URI that will be used
    if (request) {
      console.log('Redirect URI that will be used:', request.redirectUri);
    }
    
    // Additional debugging for OAuth flow
    console.log('🔍 DEBUG INFO FOR OAUTH FLOW:');
    console.log('🔍 Platform:', Platform.OS);
    console.log('🔍 Client ID:', authConfig.clientId?.substring(0, 30) + '...');
    console.log('🔍 Redirect URI:', authConfig.redirectUri);
    console.log('🔍 Use Proxy:', authConfig.useProxy);
    
    // Validate that we have a client ID
    if (!authConfig.clientId) {
      Alert.alert(
        'Configuration Error', 
        'Google OAuth is not properly configured. Please check that EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB is set.'
      );
      return;
    }
    
    if (loading) {
      console.log('Login already in progress, ignoring request');
      return;
    }
    
    if (!request) {
      Alert.alert('Login Not Ready', 'Google login is still initializing. Please wait a moment and try again.');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Calling promptAsync...');
      const result = await promptAsync();
      console.log('promptAsync result:', result);
      
      // Handle the result immediately
      if (result?.type === 'dismiss') {
        console.log('Google Sign-In dismissed by user');
        setLoading(false);
      } else if (result?.type === 'error') {
        console.log('Google Sign-In error:', result);
        setLoading(false);
        Alert.alert('Login Error', 'Failed to complete Google login: ' + (result.params?.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error initiating Google login:', error);
      Alert.alert('Login Error', 'Failed to initiate Google login: ' + (error.message || 'Unknown error'));
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
              Welcome Back
            </Animated.Text>
            <Animated.Text 
              style={[
                styles.subtitle,
                { transform: [{ translateY: slideAnim }] }
              ]}
            >
              Continue your eco-friendly journey
            </Animated.Text>
          </Animated.View>

          {/* Login Form Card */}
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

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Animated.View style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
                password && styles.inputWrapperFilled
              ]}>
                <View style={styles.inputIconContainer}>
                  <Text style={styles.inputIcon}>🔐</Text>
                </View>
                <View style={styles.inputContent}>
                  <Text style={[styles.inputLabel, passwordFocused && styles.inputLabelFocused]}>
                    Password
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#9E9E9E"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                  />
                </View>
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity 
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonLoading,
                (!email || !password) && styles.loginButtonDisabled
              ]}
              onPress={handleLogin}
              disabled={loading || !email || !password}
              activeOpacity={0.9}
            >
              <View style={styles.buttonContent}>
                {loading && (
                  <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIcon} />
                )}
                <Text style={styles.loginButtonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </View>
              <View style={styles.buttonGlow} />
            </TouchableOpacity>

            {/* OAuth Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity
              style={styles.googleSignInButton}
              onPress={handleGoogleLogin}
              disabled={loading || !request}
              activeOpacity={0.9}
            >
              <View style={styles.googleSignInButtonContent}>
                <View style={styles.googleIconContainer}>
                  <Text style={styles.googleIcon}>G</Text>
                </View>
                <Text style={styles.googleSignInButtonText}>
                  {loading ? 'Signing in with Google...' : 'Sign in with Google'}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Admin Login Hint */}
          <Animated.View 
            style={[
              styles.adminHint,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.adminHintTitle}>🔑 Admin Access</Text>
            <Text style={styles.adminHintText}>Email: admin@ecolens.com</Text>
            <Text style={styles.adminHintText}>Password: EcoAdmin123!</Text>
            <TouchableOpacity 
              style={styles.adminQuickLogin}
              onPress={() => {
                setEmail('admin@ecolens.com');
                setPassword('EcoAdmin123!');
              }}
            >
              <Text style={styles.adminQuickLoginText}>Quick Admin Login</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Sign Up Link */}
          <Animated.View 
            style={[
              styles.signUpSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('SignUp')}
              activeOpacity={0.7}
            >
              <Text style={styles.signUpLink}>Create Account</Text>
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
  eyeButton: {
    padding: 12,
    marginLeft: 8,
  },
  eyeIcon: {
    fontSize: 18,
    opacity: 0.7,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 28,
    paddingVertical: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#1B5E20',
    fontWeight: '700',
    letterSpacing: 0.3,
    textAlign: 'center',
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
    marginBottom: 15,
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  googleSignInButton: {
    position: 'relative',
    backgroundColor: '#4285F4',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3367D6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  googleSignInButtonDisabled: {
    backgroundColor: '#A0C6FF',
  },
  googleSignInButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleSignInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
  adminHint: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  adminHintTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  adminHintText: {
    fontSize: 12,
    color: '#C8E6C9',
    textAlign: 'center',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  adminQuickLogin: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'center',
  },
  adminQuickLoginText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default LoginScreen;