/**
 * CartToast Component
 * Animated toast notification for cart actions
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import theme from '../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const CartToast = ({ visible, message, onPress, onHide }) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const cartScale = useRef(new Animated.Value(0.5)).current;
  const cartTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Cart icon animation
        Animated.sequence([
          Animated.spring(cartScale, {
            toValue: 1.2,
            tension: 100,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.spring(cartScale, {
            toValue: 1,
            tension: 100,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        // Sliding cart animation
        Animated.sequence([
          Animated.timing(cartTranslateX, {
            toValue: 20,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(cartTranslateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Auto-hide after 3 seconds
      const timeout = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [visible]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [
                { scale: cartScale },
                { translateX: cartTranslateX },
              ],
            },
          ]}
        >
          <Text style={styles.cartIcon}>🛒</Text>
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.tapHint}>Tap to view cart</Text>
        </View>
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkIcon}>✓</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: theme.spacing.m,
    right: theme.spacing.m,
    zIndex: 9999,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    ...theme.shadows.large,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  iconContainer: {
    marginRight: theme.spacing.m,
  },
  cartIcon: {
    fontSize: 32,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs / 2,
  },
  tapHint: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.s,
  },
  checkmarkIcon: {
    color: theme.colors.textOnPrimary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CartToast;
