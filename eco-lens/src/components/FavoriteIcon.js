/**
 * FavoriteIcon Component
 * Reusable animated star icon for favorites functionality
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../hooks/useFavorites';
import theme from '../styles/theme';

const FavoriteIcon = ({ 
  product, 
  size = 24, 
  style, 
  iconStyle,
  showFeedback = true,
  disabled = false,
  onToggle // Optional callback
}) => {
  const { isFavorited, toggleFavorite, loading } = useFavorites();
  const [isToggling, setIsToggling] = useState(false);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Check if product is favorited
  const productId = product?.id || product?._id;
  const favorited = productId ? isFavorited(productId) : false;

  // Handle toggle favorite
  const handleToggleFavorite = async () => {
    if (!product || disabled || isToggling) return;

    // Prevent double taps
    setIsToggling(true);

    try {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate(10); // Light haptic
      }

      // Start animation
      startToggleAnimation();

      // Toggle favorite status
      const success = await toggleFavorite(product);

      if (success) {
        // Success animation
        startSuccessAnimation();
        
        // Optional callback
        if (onToggle) {
          onToggle(productId, !favorited);
        }
      } else {
        // Error animation
        startErrorAnimation();
        
        if (showFeedback) {
          Alert.alert(
            'Error',
            'Unable to update favorites. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      startErrorAnimation();
      
      if (showFeedback) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    } finally {
      setTimeout(() => {
        setIsToggling(false);
      }, 300);
    }
  };

  // Toggle animation (immediate feedback)
  const startToggleAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Success animation (when favorited/unfavorited successfully)
  const startSuccessAnimation = () => {
    if (favorited) {
      // Adding to favorites - star and rotate
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Reset rotation
        rotateAnim.setValue(0);
      });
    } else {
      // Removing from favorites - subtle scale down
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Error animation (shake effect)
  const startErrorAnimation = () => {
    const shakeAnim = new Animated.Value(0);
    
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();

    scaleAnim.setValue(0);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  // Entrance animation when component mounts
  useEffect(() => {
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, []);

  // Determine icon name and color
  const iconName = favorited ? 'star' : 'star-outline';
  const iconColor = favorited 
    ? theme.colors.warning || '#FFD700' // Gold for favorited
    : theme.colors.textSecondary || '#666';

  // Rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Combined transform
  const animatedStyle = {
    transform: [
      { scale: Animated.multiply(scaleAnim, pulseAnim) },
      { rotate },
    ],
  };

  // Loading state - show dimmed icon
  if (loading) {
    return (
      <TouchableOpacity 
        style={[styles.container, style]} 
        disabled={true}
        activeOpacity={0.6}
      >
        <Animated.View style={[animatedStyle, iconStyle]}>
          <Ionicons
            name={iconName}
            size={size}
            color={theme.colors.borderLight || '#E0E0E0'}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, style]}
      onPress={handleToggleFavorite}
      disabled={disabled || isToggling || !productId}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Animated.View style={[animatedStyle, iconStyle]}>
        <Ionicons
          name={iconName}
          size={size}
          color={iconColor}
          style={[
            isToggling && styles.toggling,
            disabled && styles.disabled
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4, // Increased touch area
  },
  toggling: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.3,
  },
});

export default FavoriteIcon;
