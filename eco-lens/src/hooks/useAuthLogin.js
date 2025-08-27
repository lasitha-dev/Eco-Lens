import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        // Add a delay to show splash screen
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const token = await AsyncStorage.getItem('authToken');
        const userData = await AsyncStorage.getItem('userData');
        if (token && userData) {
          setAuth({
            token,
            user: JSON.parse(userData)
          });
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const updateAuth = async (authData) => {
    try {
      if (authData) {
        await AsyncStorage.setItem('authToken', authData.token);
        await AsyncStorage.setItem('userData', JSON.stringify(authData.user));
        setAuth(authData);
      } else {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        setAuth(null);
      }
    } catch (error) {
      console.error('Error updating auth data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth: updateAuth, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);