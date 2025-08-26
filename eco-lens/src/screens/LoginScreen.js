import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Input from '../components/InputLogin'; // Updated reference
import Button from '../components/ButtonLogin'; // Updated reference
import { colors, spacing } from '../constants/themeLogin'; // Updated reference

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Placeholder: Replace with actual login logic later
    console.log('Login attempted with:', { email, password });
    // Navigate or show success once integrated with auth
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Eco-Lens</Text>
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
      <Button title="Login" onPress={handleLogin} />
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
    padding: spacing.medium,
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
});

export default LoginScreen;