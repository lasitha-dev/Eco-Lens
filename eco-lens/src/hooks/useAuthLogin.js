import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const loadAuth = async () => {
      try {
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
    <AuthContext.Provider value={{ auth, setAuth: updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);