import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Button } from '../components';
import { colors } from '../constants/colors';
import api from '../api/auth';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ENTER YOUR EMAIL ADDRESS TO RESET YOUR PASSWORD</Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      {error && <Text style={styles.error}>{error}</Text>}
      {success && <Text style={styles.success}>Reset link sent! Check your email.</Text>}
      <Button
        title="Reset Password"
        onPress={handleReset}
        loading={loading}
        style={styles.button}
      />
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.cancel}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.green,
    marginBottom: 10,
  },
  cancel: {
    textAlign: 'center',
    color: colors.green,
    fontSize: 16,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;