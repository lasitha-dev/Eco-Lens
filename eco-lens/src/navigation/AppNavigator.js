import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuthLogin';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import CustomerTabNavigator from './CustomerTabNavigator';
import AdminDashboard from '../screens/AdminDashboard';
import MyProfileScreen from '../screens/MyProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import OnboardingSurvey from '../screens/OnboardingSurvey';
import GoogleAuthCallbackScreen from '../screens/GoogleAuthCallbackScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { auth, user, isLoading, isAdmin, isCustomer } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {auth ? (
        // Authenticated user screens
        isAdmin ? (
          // Admin screens
          <>
            <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
          </>
        ) : (
          // Customer screens
          <>
            <Stack.Screen name="Dashboard" component={CustomerTabNavigator} />
            <Stack.Screen name="Home" component={HomeScreen} />
            {/* Onboarding Survey */}
             <Stack.Screen name="OnboardingSurvey" component={OnboardingSurvey} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          </>
        )
      ) : (
        // Non-authenticated screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="GoogleAuthCallback" component={GoogleAuthCallbackScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;


