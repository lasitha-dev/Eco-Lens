import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from "./src/hooks/useAuthLogin";
import AuthStack from './src/navigation/indexLogin';
import AppNavigator from './src/navigation/AppNavigator';

// A component to handle the navigation logic based on auth state
const Navigation = () => {
  const { auth } = useAuth();
  return (
    <NavigationContainer>
      {auth ? <AppNavigator /> : <AuthStack />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
};

// The main App entry point
export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}
