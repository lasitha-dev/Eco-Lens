/**
 * Test OAuth Screen
 * Simple screen to test OAuth functionality without the full login flow
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import oauthDebug from '../utils/oauthDebug';

const TestOAuthScreen = ({ navigation }) => {
  const { debugOAuthConfig, extractTokensFromUrl } = oauthDebug;

  useEffect(() => {
    console.log('TestOAuthScreen mounted');
    // Run debug on mount
    testOAuthDebug();
  }, []);

  const testOAuthDebug = () => {
    try {
      console.log('Testing OAuth Debug...');
      const result = debugOAuthConfig();
      console.log('Debug result:', result);
      Alert.alert('Success', 'OAuth debug function working correctly');
    } catch (error) {
      console.error('OAuth Debug Error:', error);
      Alert.alert('Error', `OAuth debug failed: ${error.message}`);
    }
  };

  const testTokenExtraction = () => {
    try {
      // Test with a sample URL
      const testUrl = 'http://localhost:8081/#id_token=test-token-123&access_token=test-access-456';
      const result = extractTokensFromUrl(testUrl);
      console.log('Token extraction result:', result);
      Alert.alert('Success', `Tokens extracted: ID=${!!result.idToken}, Access=${!!result.accessToken}`);
    } catch (error) {
      console.error('Token Extraction Error:', error);
      Alert.alert('Error', `Token extraction failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OAuth Test Screen</Text>
      
      <TouchableOpacity style={styles.button} onPress={testOAuthDebug}>
        <Text style={styles.buttonText}>Test OAuth Debug</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testTokenExtraction}>
        <Text style={styles.buttonText}>Test Token Extraction</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 10,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestOAuthScreen;