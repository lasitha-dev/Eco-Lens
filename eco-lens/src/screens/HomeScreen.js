import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { colors } from '../constants/colors';
import { useAuth } from '../hooks/useAuthLogin';

const HomeScreen = ({ navigation }) => {
  const { auth, setAuth, user } = useAuth();

  // Protect this screen - redirect to Welcome if not authenticated
  useEffect(() => {
    if (!auth) {
      navigation.navigate('Welcome');
    }
  }, [auth, navigation]);

  const handleLogout = async () => {
    // Clear the auth state and token from AsyncStorage
    await setAuth(null);
    // Navigate back to Welcome screen after logout
    navigation.navigate('Welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Profile Picture */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>🌱 Eco-Lens</Text>
          <Text style={styles.subtitle}>Shop Sustainably, Live Responsibly</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileIcon}
          onPress={() => navigation.navigate('Profile')}
        >
          <View style={styles.profileCircle}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture.startsWith('/9j/') || user.profilePicture.length > 100 
                  ? `data:image/jpeg;base64,${user.profilePicture}` 
                  : user.profilePicture }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.profileText}>
                {user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'U'}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>Your sustainable shopping journey starts here</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🔍</Text>
          <Text style={styles.featureText}>Search for products to get sustainability ratings</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>⭐</Text>
          <Text style={styles.featureText}>View A-F sustainability scores</Text>
        </View>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🎯</Text>
          <Text style={styles.featureText}>Track your sustainability goals</Text>
        </View>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.buttonText}>Admin Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingLeft: 25, // Move text slightly to the right
  },
  featureCard: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    marginTop: 10,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default HomeScreen;
