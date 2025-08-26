import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { api } from '../services/api';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testNetwork = async () => {
    console.log('HI - Test Network button pressed!');
    try {
      console.log('=== NETWORK TEST ===');
      const response = await fetch('http://192.168.8.153:4000/health');
      const data = await response.json();
      console.log('Network test successful:', data);
      Alert.alert('Network Test', 'Success! Server is reachable from mobile app.');
    } catch (error) {
      console.log('Network test failed:', error);
      Alert.alert('Network Test', `Failed: ${error.message}`);
    }
  };

  const handleRegister = async () => {
    console.log('=== REGISTRATION START ===');
    console.log('HI - This is the RegisterScreen handleRegister function!');
    console.log('Form data:', { fullName, email, password, confirmPassword });
    
    if (!fullName || !email || !password || !confirmPassword) {
      console.log('Validation failed: Missing fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      console.log('Validation failed: Invalid email');
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      console.log('Validation failed: Password too short');
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Validation failed: Passwords do not match');
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    console.log('Validation passed, calling API...');
    setIsLoading(true);
    
    try {
      // First, test basic connectivity
      console.log('Testing basic connectivity...');
      const testResponse = await fetch('http://192.168.8.153:4000/health');
      console.log('Connectivity test status:', testResponse.status);
      const testData = await testResponse.json();
      console.log('Connectivity test data:', testData);
      
      console.log('Making API call to register user...');
      // Call the real API
      const result = await api.register({
        fullName,
        email,
        password,
      });

      console.log('API call successful:', result);
      setIsLoading(false);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('Login');
          }
        }
      ]);
    } catch (error) {
      console.log('API call failed:', error);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
      setIsLoading(false);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.backButton} onPress={() => navigation.goBack()}>
              ← Back
            </Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Eco-Lens and start your sustainable shopping journey</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password (min 6 characters)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={styles.testButton}
              onPress={testNetwork}
            >
              <Text style={styles.testButtonText}>Test Network Connection</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.divider} />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 20,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  testButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  testButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666666',
    fontSize: 14,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: 12,
    lineHeight: 18,
  },
});

export default RegisterScreen;
