/**
 * CustomerTabNavigator Component
 * Bottom tab navigation for customer dashboard
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Text, View } from 'react-native';
import CustomerDashboard from '../screens/customer/CustomerDashboard';
import CartScreen from '../screens/customer/CartScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import theme from '../styles/theme';

const Tab = createBottomTabNavigator();

const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 24,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingHorizontal: 8,
          height: Platform.OS === 'ios' ? 90 : 70,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 4,
          marginBottom: Platform.OS === 'ios' ? 4 : 2,
          textTransform: 'capitalize',
        },
        tabBarIconStyle: {
          marginTop: 2,
          marginBottom: -2,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
          paddingHorizontal: 2,
        },
      }}
    >
      <Tab.Screen
        name="ProductDashboard"
        component={CustomerDashboard}
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon 
              emoji="🌱" 
              size={size} 
              focused={focused}
              color={color}
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
            <TabIcon 
              emoji="🛒" 
              size={size} 
              focused={focused}
              color={color}
            />
          ),
          tabBarBadge: undefined, // Can be used to show cart item count
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon 
              emoji="👤" 
              size={size} 
              focused={focused}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Custom tab icon component with emoji and focus state
const TabIcon = ({ emoji, size, focused, color }) => {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 36,
      borderRadius: 18,
      backgroundColor: focused ? theme.colors.primaryLight : 'transparent',
      transform: [{ scale: focused ? 1.05 : 1 }],
    }}>
      <Text style={{
        fontSize: focused ? size + 2 : size - 1,
        opacity: focused ? 1 : 0.75,
        textShadowColor: focused ? 'rgba(76, 175, 80, 0.3)' : 'transparent',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      }}>
        {emoji}
      </Text>
    </View>
  );
};

export default CustomerTabNavigator;
