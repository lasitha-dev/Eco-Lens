import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthService from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  // Load stored authentication on app start
  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      setIsLoading(true);
      // Add splash screen delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const storedAuth = await AuthService.getStoredAuth();
      
      if (storedAuth) {
        // Verify token is still valid
        const isValid = await AuthService.verifyToken();
        if (isValid) {
          setAuthState(storedAuth.token);
          setUser(storedAuth.user);
          setIsAdmin(storedAuth.user.role === 'admin');
          setIsCustomer(storedAuth.user.role === 'customer');
          console.log(`✅ Restored ${storedAuth.user.role} session for:`, storedAuth.user.email);
        } else {
          // Token is invalid, clear stored auth
          await AuthService.clearAuth();
          console.log('⚠️  Stored token is invalid, cleared authentication');
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      await AuthService.clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const setAuth = async (authData) => {
    try {
      if (authData) {
        // Login case
        setAuthState(authData.token);
        setUser(authData.user);
        setIsAdmin(authData.user.role === 'admin');
        setIsCustomer(authData.user.role === 'customer');
        
        // Store authentication data
        await AuthService.storeAuth(authData.token, authData.user);
        console.log(`✅ Authenticated ${authData.user.role}:`, authData.user.email);
      } else {
        // Logout case
        setAuthState(null);
        setUser(null);
        setIsAdmin(false);
        setIsCustomer(false);
        
        // Clear stored authentication data
        await AuthService.clearAuth();
        console.log('✅ Logged out successfully');
      }
    } catch (error) {
      console.error('Error setting auth:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logoutUser();
      await setAuth(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Force clear even if there's an error
      await setAuth(null);
    }
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    setIsAdmin(updatedUser.role === 'admin');
    setIsCustomer(updatedUser.role === 'customer');
  };

  const checkAdminAccess = () => {
    if (!auth || !user) {
      throw new Error('Not authenticated');
    }
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
    return true;
  };

  const checkCustomerAccess = () => {
    if (!auth || !user) {
      throw new Error('Not authenticated');
    }
    if (!isCustomer) {
      throw new Error('Customer access required');
    }
    return true;
  };

  const value = {
    auth,
    user,
    isAdmin,
    isCustomer,
    isLoading,
    setAuth,
    logout,
    updateUser,
    checkAdminAccess,
    checkCustomerAccess,
    // Helper methods
    isAuthenticated: !!auth && !!user,
    getUserRole: () => user?.role || null,
    getUserName: () => user ? `${user.firstName} ${user.lastName}` : null,
    getUserEmail: () => user?.email || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);