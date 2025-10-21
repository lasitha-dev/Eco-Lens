/**
 * MilestoneNotification Component
 * Shows progress milestone notifications (25%, 50%, 75%, 90% progress)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../styles/theme';

const { width: screenWidth } = Dimensions.get('window');

const MilestoneNotification = ({ 
  visible, 
  onClose, 
  milestone, 
  goal,
  autoClose = true,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation values
  const translateY = useRef(new Animated.Value(-200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Get milestone configuration
  const getMilestoneConfig = (percentage) => {
    if (percentage >= 90) {
      return {
        icon: 'rocket',
        color: '#FF6B35',
        gradient: ['#FF6B35', '#FF5722'],
        title: 'Almost There!',
        emoji: '🚀',
        message: 'You\'re so close to achieving your goal!'
      };
    } else if (percentage >= 75) {
      return {
        icon: 'trending-up',
        color: '#FF9800',
        gradient: ['#FF9800', '#F57C00'],
        title: 'Great Progress!',
        emoji: '📈',
        message: 'You\'re making excellent progress!'
      };
    } else if (percentage >= 50) {
      return {
        icon: 'flash',
        color: '#2196F3',
        gradient: ['#2196F3', '#1976D2'],
        title: 'Halfway There!',
        emoji: '⚡',
        message: 'You\'ve reached the halfway point!'
      };
    } else if (percentage >= 25) {
      return {
        icon: 'leaf',
        color: '#4CAF50',
        gradient: ['#4CAF50', '#388E3C'],
        title: 'Good Start!',
        emoji: '🌱',
        message: 'You\'re making sustainable choices!'
      };
    } else {
      return {
        icon: 'checkmark',
        color: '#4CAF50',
        gradient: ['#4CAF50', '#388E3C'],
        title: 'Keep Going!',
        emoji: '✨',
        message: 'Every sustainable choice counts!'
      };
    }
  };

  const config = getMilestoneConfig(milestone?.percentage || 0);

  // Pan responder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy < 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy < -50) {
          // Swipe up to dismiss
          startExitAnimation();
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Start entrance animation
  const startEntranceAnimation = () => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate progress bar
    setTimeout(() => {
      Animated.timing(progressWidth, {
        toValue: milestone?.percentage || 0,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, 500);
  };

  // Start exit animation
  const startExitAnimation = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      if (onClose) onClose();
    });
  };

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      setTimeout(() => {
        startEntranceAnimation();
      }, 100);
      
      if (autoClose) {
        setTimeout(() => {
          startExitAnimation();
        }, duration);
      }
    }
  }, [visible]);

  // Handle manual close
  const handleClose = () => {
    startExitAnimation();
  };

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.notification,
          {
            transform: [
              { translateY },
              { scale },
            ],
            opacity,
          }
        ]}
        {...panResponder.panHandlers}
      >
        <LinearGradient
          colors={config.gradient}
          style={styles.gradientContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.content}>
            {/* Icon and emoji */}
            <View style={styles.iconContainer}>
              <Text style={styles.emoji}>{config.emoji}</Text>
              <Ionicons name={config.icon} size={24} color="white" />
            </View>

            {/* Text content */}
            <View style={styles.textContent}>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.message}>{config.message}</Text>
              
              {goal && (
                <Text style={styles.goalName} numberOfLines={1}>
                  "{goal.title}"
                </Text>
              )}
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {milestone?.percentage?.toFixed(0)}%
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width: progressWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                    }
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Swipe indicator */}
          <View style={styles.swipeIndicator}>
            <View style={styles.swipeHandle} />
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50, // Account for status bar
    paddingHorizontal: theme.spacing.m,
  },

  notification: {
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    ...theme.shadows.large,
  },

  gradientContainer: {
    padding: theme.spacing.m,
  },

  closeButton: {
    position: 'absolute',
    top: theme.spacing.s,
    right: theme.spacing.s,
    zIndex: 1,
    padding: theme.spacing.xs,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.m,
  },

  emoji: {
    fontSize: 24,
    marginRight: theme.spacing.xs,
  },

  textContent: {
    flex: 1,
    marginRight: theme.spacing.s,
  },

  title: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
    marginBottom: 2,
  },

  message: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
  },

  goalName: {
    fontSize: theme.typography.fontSize.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
  },

  progressContainer: {
    alignItems: 'center',
    minWidth: 60,
  },

  progressText: {
    fontSize: theme.typography.fontSize.h6,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },

  progressBar: {
    width: 50,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },

  swipeIndicator: {
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },

  swipeHandle: {
    width: 30,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 2,
  },
});

export default MilestoneNotification;
