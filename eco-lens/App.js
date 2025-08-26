import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet } from 'react-native';

// Login-specific imports
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from "./src/hooks/useAuthLogin";
import AuthStack from './src/navigation/indexLogin'; 

// 👉 App entry point
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AuthStack />
        <StatusBar style="auto" />
      </NavigationContainer>
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