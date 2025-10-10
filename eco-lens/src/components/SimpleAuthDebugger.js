/**
 * Simple Authentication Debugger Component
 * Helps debug authentication issues in development
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuthLogin';

const SimpleAuthDebugger = ({ visible, onClose }) => {
  const { user, auth } = useAuth();
  const [debugInfo, setDebugInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugTest = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Running authentication debug test...');
      
      // Check AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      // Try both possible keys for auth token
      let authToken = await AsyncStorage.getItem('@eco_lens_auth_token');
      if (!authToken) {
        authToken = await AsyncStorage.getItem('@eco_lens_token');
      }
      // Try both possible keys for user data
      let userData = await AsyncStorage.getItem('@eco_lens_user_data');
      if (!userData) {
        userData = await AsyncStorage.getItem('@eco_lens_user');
      }
      
      // Check auth context
      const authContext = {
        hasUser: !!user,
        hasAuth: !!auth,
        userId: user?.id,
        userEmail: user?.email,
        authTokenLength: auth?.length || 0
      };
      
      // Check AsyncStorage data
      const asyncStorageData = {
        keys: keys,
        hasAuthToken: !!authToken,
        authTokenLength: authToken?.length || 0,
        hasUserData: !!userData,
        userDataPreview: userData ? JSON.parse(userData) : null
      };
      
      const debugResult = {
        timestamp: new Date().toISOString(),
        authContext,
        asyncStorageData,
        issues: []
      };
      
      // Identify issues
      if (!user) debugResult.issues.push('No user in auth context');
      if (!auth) debugResult.issues.push('No auth token in context');
      if (!authToken) debugResult.issues.push('No auth token in AsyncStorage');
      if (!userData) debugResult.issues.push('No user data in AsyncStorage');
      
      if (auth && authToken && auth !== authToken) {
        debugResult.issues.push('Auth context token differs from AsyncStorage token');
      }
      
      setDebugInfo(debugResult);
      console.log('🔍 Debug result:', debugResult);
      
    } catch (error) {
      console.error('Error running debug test:', error);
      setDebugInfo({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will clear all stored authentication data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear both possible keys
              await AsyncStorage.removeItem('@eco_lens_auth_token');
              await AsyncStorage.removeItem('@eco_lens_token');
              await AsyncStorage.removeItem('@eco_lens_user_data');
              await AsyncStorage.removeItem('@eco_lens_user');
              setDebugInfo(null);
              Alert.alert('Success', 'All data cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (visible) {
      runDebugTest();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Auth Debugger</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {isLoading ? (
            <Text style={styles.loadingText}>Running debug test...</Text>
          ) : debugInfo ? (
            <View>
              <Text style={styles.sectionTitle}>Debug Results</Text>
              <Text style={styles.timestamp}>
                {new Date(debugInfo.timestamp).toLocaleString()}
              </Text>
              
              {debugInfo.error ? (
                <Text style={styles.errorText}>Error: {debugInfo.error}</Text>
              ) : (
                <>
                  <View style={styles.section}>
                    <Text style={styles.subsectionTitle}>Auth Context</Text>
                    <Text style={styles.infoText}>
                      Has User: {debugInfo.authContext.hasUser ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.infoText}>
                      Has Auth: {debugInfo.authContext.hasAuth ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.infoText}>
                      User ID: {debugInfo.authContext.userId || 'N/A'}
                    </Text>
                    <Text style={styles.infoText}>
                      User Email: {debugInfo.authContext.userEmail || 'N/A'}
                    </Text>
                    <Text style={styles.infoText}>
                      Auth Token Length: {debugInfo.authContext.authTokenLength}
                    </Text>
                  </View>
                  
                  <View style={styles.section}>
                    <Text style={styles.subsectionTitle}>AsyncStorage</Text>
                    <Text style={styles.infoText}>
                      Keys: {debugInfo.asyncStorageData.keys.length}
                    </Text>
                    <Text style={styles.infoText}>
                      Has Auth Token: {debugInfo.asyncStorageData.hasAuthToken ? '✅' : '❌'}
                    </Text>
                    <Text style={styles.infoText}>
                      Auth Token Length: {debugInfo.asyncStorageData.authTokenLength}
                    </Text>
                    <Text style={styles.infoText}>
                      Has User Data: {debugInfo.asyncStorageData.hasUserData ? '✅' : '❌'}
                    </Text>
                  </View>
                  
                  {debugInfo.issues.length > 0 && (
                    <View style={styles.section}>
                      <Text style={styles.subsectionTitle}>Issues Found</Text>
                      {debugInfo.issues.map((issue, index) => (
                        <Text key={index} style={styles.issueText}>
                          • {issue}
                        </Text>
                      ))}
                    </View>
                  )}
                </>
              )}
            </View>
          ) : null}
        </ScrollView>
        
        <View style={styles.actions}>
          <TouchableOpacity onPress={runDebugTest} style={styles.button}>
            <Text style={styles.buttonText}>Run Test</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={clearAllData} style={[styles.button, styles.clearButton]}>
            <Text style={styles.buttonText}>Clear Data</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    padding: 16,
    maxHeight: 400,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  issueText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SimpleAuthDebugger;
