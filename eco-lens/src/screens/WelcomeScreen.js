import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* App Branding Section */}
        <View style={styles.brandingSection}>
          <Text style={styles.logo}>🌱</Text>
          <Text style={styles.appName}>Eco-Lens</Text>
          <Text style={styles.tagline}>The Sustainable Shopping Assistant</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to Eco-Lens</Text>
          <Text style={styles.welcomeDescription}>
            Make informed, sustainable shopping decisions with our eco-friendly product ratings
          </Text>
        </View>

        {/* Feature Buttons */}
        <View style={styles.featureSection}>
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
        </View>

        {/* Get Started Button */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: width * 0.06, // 6% of screen width for responsive padding
    paddingTop: height * 0.05, // 5% of screen height
    paddingBottom: height * 0.08, // 8% of screen height
  },
  brandingSection: {
    alignItems: 'center',
    marginBottom: height * 0.06, // 6% of screen height
  },
  logo: {
    fontSize: Math.min(width * 0.15, 60), // Responsive font size with max limit
    marginBottom: 16,
  },
  appName: {
    fontSize: Math.min(width * 0.08, 32), // Responsive font size
    fontWeight: 'bold',
    color: '#2E7D32', // Dark green
    marginBottom: 8,
  },
  tagline: {
    fontSize: Math.min(width * 0.04, 16), // Responsive font size
    color: '#666666', // Dark gray
    textAlign: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: height * 0.08, // 8% of screen height
  },
  welcomeTitle: {
    fontSize: Math.min(width * 0.07, 28), // Responsive font size
    fontWeight: 'bold',
    color: '#2E7D32', // Dark green
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeDescription: {
    fontSize: Math.min(width * 0.04, 16), // Responsive font size
    color: '#666666', // Dark gray
    textAlign: 'center',
    lineHeight: Math.min(width * 0.05, 24), // Responsive line height
    paddingHorizontal: width * 0.04, // 4% of screen width
  },
  featureSection: {
    marginBottom: height * 0.08, // 8% of screen height
    gap: 16,
  },
  featureButton: {
    backgroundColor: '#E8F5E8', // Light green background
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
    fontSize: Math.min(width * 0.06, 24), // Responsive font size
    marginRight: 16,
  },
  featureText: {
    fontSize: Math.min(width * 0.045, 18), // Responsive font size
    color: '#2E7D32', // Dark green
    fontWeight: '500',
    flex: 1,
  },
  buttonSection: {
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#4CAF50', // Green
    paddingVertical: Math.min(height * 0.02, 16), // Responsive padding
    paddingHorizontal: Math.min(width * 0.15, 60), // Responsive padding
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: Math.min(width * 0.05, 20), // Responsive font size
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default WelcomeScreen;

