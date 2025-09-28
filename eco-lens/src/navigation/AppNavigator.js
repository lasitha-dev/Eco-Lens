import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuthLogin';

import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import AdminDashboard from '../screens/AdminDashboard';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import OnboardingSurvey from '../screens/OnboardingSurvey';

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
      initialRouteName={auth ? (isAdmin ? 'AdminDashboard' : 'Dashboard') : 'Welcome'}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Authentication Screens */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      
      {/* Common Screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* Onboarding Survey */}
      <Stack.Screen name="OnboardingSurvey" component={OnboardingSurvey} />
      
      {/* Customer Screens */}
      <Stack.Screen name="Dashboard" component={CustomerDashboard} />
      
      {/* Admin Screens */}
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
    </Stack.Navigator>
  );
};

export default AppNavigator;


