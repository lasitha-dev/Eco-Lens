// src/screens/LoginScreen.js

import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import Input from '../components/InputLogin';
import Button from '../components/ButtonLogin';
import { colors, spacing } from '../constants/themeLogin';
import { mockLogin } from '../utils/mockLogin'; // Import the mock login function
import { useAuth } from '../hooks/useAuthLogin'; // Import useAuth hook

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth(); // Get setAuth from the context

  const handleLogin = async () => {
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const { token, user } = await mockLogin(email, password);
      // On successful mock login
      await setAuth({ token, user });
      console.log('Login successful! Token:', token);
    } catch (err) {
      // On failed mock login
      setError(err.message);
      console.log('Login failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Eco-Lens</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="small" color={colors.primary} />}
      <Text style={styles.link} onPress={() => navigation.navigate('Signup')}>
        Don't have an account? Sign up
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.large, // Increased padding
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  input: {
    marginBottom: spacing.medium,
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.medium,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
});

export default LoginScreen;