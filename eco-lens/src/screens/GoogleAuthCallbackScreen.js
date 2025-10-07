import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Alert } from 'react-native';
import AuthService from '../api/authService';
import SurveyService from '../api/surveyService';
import { useAuth } from '../hooks/useAuthLogin';
import * as Linking from 'expo-linking';

const GoogleAuthCallbackScreen = ({ route, navigation }) => {
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        console.log('GoogleAuthCallbackScreen accessed with route params:', route.params);
        console.log('Current route:', route);
        
        // Get the URL that was used to open the app
        const url = Linking.useURL();
        console.log('Current URL:', url);
        
        // Check if we have an ID token in the route params
        if (route.params?.idToken) {
          console.log('ID token found in route params, attempting login');
          const result = await AuthService.googleLogin(route.params.idToken);
          await setAuth(result);
          
          if (result.user.role === 'admin') {
            navigation.navigate('AdminDashboard');
          } else {
            try {
              // Check if customer has completed or skipped the survey
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
        } else {
          console.log('No ID token in route params, checking for error');
          // Check if there's an error
          if (route.params?.error) {
            throw new Error(route.params.error);
          }
          
          // Since we're using Expo AuthSession, we don't need to handle the redirect URL manually
          // The token should already be available in the response in LoginScreen
          console.warn('GoogleAuthCallbackScreen accessed but may not be needed with Expo AuthSession');
          navigation.navigate('Login');
        }
      } catch (error) {
        console.error('Google authentication error:', error);
        Alert.alert(
          'Authentication Error',
          error.message || 'Failed to complete Google authentication. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      }
    };

    handleRedirect();
  }, [route.params, setAuth, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>Completing authentication...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default GoogleAuthCallbackScreen;