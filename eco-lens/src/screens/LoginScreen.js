import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Input, Button } from '../components';
import { colors } from '../constants/colors';

const LoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Input placeholder="Email" style={styles.input} />
      <Input placeholder="Password" secureTextEntry style={styles.input} />
      <Button title="Login" style={styles.button} />
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgot}>Forgot Password?</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: colors.green,
    marginBottom: 10,
  },
  forgot: {
    color: colors.green,
    textAlign: 'center',
  },
});

export default LoginScreen;