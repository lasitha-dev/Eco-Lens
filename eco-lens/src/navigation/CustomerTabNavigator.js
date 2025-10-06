/**
 * CustomerTabNavigator Component
 * Modern bottom tab navigation for customer dashboard
 */

import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Text, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import CartScreen from '../screens/customer/CartScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { useAuth } from '../hooks/useAuthLogin';
import theme from '../styles/theme';

const Tab = createBottomTabNavigator();

const CustomerTabNavigator = () => {
  const { cartCount } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.textOnPrimary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarBackground: () => (
          <LinearGradient
            colors={[theme.colors.primaryLight, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flex: 1,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          />
        ),
        tabBarStyle: {
          backgroundColor: 'transparent', // Make background transparent to show gradient
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: theme.colors.shadowDark,
          shadowOffset: {
            width: 0,
            height: -8,
          },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 32 : 16,
          paddingHorizontal: 16,
          height: Platform.OS === 'ios' ? 92 : 76,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          left: 8,
          right: 8,
          bottom: 0,
          // Modern glassmorphism effect
          backdropFilter: 'blur(20px)',
        },
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.caption,
          fontWeight: theme.typography.fontWeight.semiBold,
          marginTop: 4,
          marginBottom: 2,
          letterSpacing: 0.3,
          fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          paddingHorizontal: 6,
          marginHorizontal: 4,
        },
      }}
    >
      <Tab.Screen
        name="ProductDashboard"
        component={CustomerDashboard}
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <ModernTabIcon
              iconName="home"
              size={size}
              focused={focused}
              color={color}
              label="Home"
            />
          ),
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size, focused }) => (
            <ModernTabIcon
              iconName="bag-handle"
              size={size}
              focused={focused}
              color={color}
              label="Cart"
            />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <ModernTabIcon
              iconName="person"
              size={size}
              focused={focused}
              color={color}
              label="Profile"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Modern animated tab icon component
const ModernTabIcon = ({ iconName, size, focused, color, label }) => {
  const scaleValue = new Animated.Value(focused ? 1.1 : 1);
  const opacityValue = new Animated.Value(focused ? 1 : 0.7);

  useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();

    Animated.timing(opacityValue, {
      toValue: focused ? 1 : 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: scaleValue }],
        opacity: opacityValue,
      }}
    >
      <View style={{
        width: focused ? 48 : 44,
        height: focused ? 48 : 44,
        borderRadius: 16,
        backgroundColor: focused
          ? 'rgba(255, 255, 255, 0.2)'
          : 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 2,
        borderWidth: focused ? 1 : 0,
        borderColor: focused ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
        shadowColor: focused ? '#000' : 'transparent',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: focused ? 0.25 : 0,
        shadowRadius: 8,
        elevation: focused ? 6 : 0,
      }}>
        <Ionicons
          name={focused ? `${iconName}` : `${iconName}-outline`}
          size={focused ? size + 4 : size + 2}
          color={color}
          style={{
            textShadowColor: focused ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          }}
        />
      </View>
    </Animated.View>
  );
};

export default CustomerTabNavigator;
