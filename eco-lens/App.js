import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { AuthProvider, useAuth } from "./src/hooks/useAuthLogin";
import { FavoritesProvider } from "./src/hooks/useFavorites";
import AppNavigator from './src/navigation/AppNavigator';

// Add this line to properly handle redirects
WebBrowser.maybeCompleteAuthSession();

// Simple loading splash component
const LoadingSplash = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#1B5E20', justifyContent: 'center', alignItems: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      <Text style={{ fontSize: 70, marginBottom: 20 }}>🌱</Text>
      <Text style={{ fontSize: 42, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 2 }}>Eco-Lens</Text>
      <Text style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.9)', marginTop: 8 }}>Sustainable Shopping Assistant</Text>
    </View>
  );
};

// A component to handle the navigation logic based on auth state
const Navigation = () => {
  const { auth, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSplash />;
  }

  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Login: 'login',
        GoogleAuthCallback: 'auth/google-callback',
        // Add a fallback for any other routes
        '*': '*',
      },
    },
  };

  console.log('Linking prefixes:', linking.prefixes);

  return (
    <FavoritesProvider> 
      <NavigationContainer linking={linking} fallback={<Text>Loading...</Text>}>
        <AppNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </FavoritesProvider>
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