import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  // Background floating elements animation
  const floatingElements = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    // Start animations when component mounts
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Logo entrance animation
    Animated.sequence([
      Animated.timing(logoScale, {
        toValue: 1.2,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Content fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Content slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      delay: 600,
      useNativeDriver: true,
    }).start();

    // Background animation
    Animated.loop(
      Animated.timing(backgroundAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Floating elements animation
    floatingElements.forEach((element, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(element, {
            toValue: 1,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(element, {
            toValue: 0,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  };

  const handleGetStartedPress = () => {
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Login');
    });
  };

  // Logo rotation interpolation
  const logoRotate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Background gradient animation
  const backgroundOpacity = backgroundAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Animated Background Elements */}
      <View style={styles.backgroundContainer}>
        <Animated.View 
          style={[
            styles.floatingElement,
            styles.floatingElement1,
            {
              opacity: floatingElements[0].interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
              transform: [{
                translateY: floatingElements[0].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -20],
                }),
              }],
            },
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingElement,
            styles.floatingElement2,
            {
              opacity: floatingElements[1].interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.2],
              }),
              transform: [{
                translateY: floatingElements[1].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              }],
            },
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingElement,
            styles.floatingElement3,
            {
              opacity: floatingElements[2].interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.25],
              }),
              transform: [{
                translateY: floatingElements[2].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              }],
            },
          ]}
        />
        <Animated.View 
          style={[
            styles.floatingElement,
            styles.floatingElement4,
            {
              opacity: floatingElements[3].interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.2],
              }),
              transform: [{
                translateY: floatingElements[3].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                }),
              }],
            },
          ]}
        />
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding Section with Animated Logo */}
        <View style={styles.brandingSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [
                  { scale: logoScale },
                  { rotate: logoRotate },
                ],
              },
            ]}
          >
            <Text style={styles.logo}>🌱</Text>
          </Animated.View>
          <Animated.Text 
            style={[
              styles.appName,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Eco-Lens
          </Animated.Text>
          <Animated.Text 
            style={[
              styles.tagline,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            The Sustainable Shopping Assistant
          </Animated.Text>
        </View>

        {/* Welcome Message */}
        <Animated.View 
          style={[
            styles.welcomeSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.welcomeTitle}>Welcome to Eco-Lens</Text>
          <Text style={styles.welcomeDescription}>
            Make informed, sustainable shopping decisions with our eco-friendly product ratings
          </Text>
        </Animated.View>

        {/* Feature Buttons */}
        <Animated.View 
          style={[
            styles.featureSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureIcon}>🔍🌿</Text>
            <Text style={styles.featureText}>Product Sustainability Ratings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureIcon}>🌿</Text>
            <Text style={styles.featureText}>Eco-Friendly Alternatives</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.featureButton}>
            <Text style={styles.featureIcon}>📊</Text>
            <Text style={styles.featureText}>Personal Sustainability Goals</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Refined Get Started Button */}
        <Animated.View 
          style={[
            styles.buttonSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.getStartedButton}
              onPress={handleGetStartedPress}
              activeOpacity={0.8}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.getStartedText}>Get Started</Text>
                <Text style={styles.buttonArrow}>→</Text>
              </View>
              <View style={styles.buttonGlow} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: '#E8F5E8',
  },
  floatingElement1: {
    width: 80,
    height: 80,
    top: height * 0.1,
    right: width * 0.1,
  },
  floatingElement2: {
    width: 60,
    height: 60,
    top: height * 0.3,
    left: width * 0.05,
  },
  floatingElement3: {
    width: 100,
    height: 100,
    top: height * 0.6,
    right: width * 0.05,
  },
  floatingElement4: {
    width: 70,
    height: 70,
    top: height * 0.8,
    left: width * 0.15,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.05,
    paddingBottom: height * 0.08,
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: height * 0.06,
  },
  logoContainer: {
    marginBottom: 16,
    padding: 10,
  },
  logo: {
    fontSize: Math.min(width * 0.15, 60),
  },
  appName: {
    fontSize: Math.min(width * 0.08, 32),
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  tagline: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#666666',
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: height * 0.08,
  },
  welcomeTitle: {
    fontSize: Math.min(width * 0.07, 28),
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: Math.min(width * 0.04, 16),
    color: '#666666',
    textAlign: 'center',
    lineHeight: Math.min(width * 0.05, 24),
    paddingHorizontal: width * 0.04,
  },
  featureSection: {
    marginBottom: height * 0.08,
    gap: 16,
  },
  featureButton: {
    backgroundColor: '#E8F5E8',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featureIcon: {
    fontSize: Math.min(width * 0.06, 24),
    marginRight: 16,
  },
  featureText: {
    fontSize: Math.min(width * 0.045, 18),
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
  },
  buttonSection: {
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'relative',
  },
  getStartedButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: Math.min(height * 0.02, 16),
    paddingHorizontal: Math.min(width * 0.15, 60),
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
    textAlign: 'center',
    marginRight: 8,
  },
  buttonArrow: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.05, 20),
    fontWeight: 'bold',
  },
  buttonGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
  },
});

export default WelcomeScreen;

