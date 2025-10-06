import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AuthService from '../api/authService';
import { useAuth } from '../hooks/useAuthLogin';

const GoogleAuthCallbackScreen = ({ route, navigation }) => {
  const { setAuth } = useAuth();

  useEffect(() => {
    const handleRedirect = async () => {
      const { url } = route.params;
      try {
        const result = await AuthService.handleGoogleRedirect(url);
        await setAuth(result);

        if (result.user.role === 'admin') {
          navigation.navigate('AdminDashboard');
        } else {
          navigation.navigate('Dashboard');
        }
      } catch (error) {
        console.error('Google authentication error:', error);
        navigation.navigate('Login');
      }
    };

    handleRedirect();
  }, [route.params, setAuth, navigation]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GoogleAuthCallbackScreen;
