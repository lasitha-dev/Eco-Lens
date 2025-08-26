// App.js

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider, useAuth } from "./src/hooks/useAuthLogin";
import AuthStack from './src/navigation/indexLogin';
import AppStack from './src/navigation/AppStack'; // Import the new AppStack

// A component to handle the navigation logic based on auth state
const Navigation = () => {
  const { auth } = useAuth();
  return (
    <NavigationContainer>
      {auth ? <AppStack /> : <AuthStack />}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});