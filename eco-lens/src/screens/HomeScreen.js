// src/screens/HomeScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from '../components/ButtonLogin'; // Re-use the Button component
import { useAuth } from '../hooks/useAuthLogin'; // Import useAuth hook

const HomeScreen = () => {
  const { setAuth } = useAuth();

  const handleLogout = async () => {
    // Clear the auth state and token from AsyncStorage
    await setAuth(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome, you are logged in!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 20,
  },
});

export default HomeScreen;