/**
 * AchievementAnimation Component
 * Displays celebratory animations when sustainability goals are achieved
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../styles/theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const AchievementAnimation = ({ 
  visible, 
  onClose, 
  goal, 
  type = 'goal_achieved', // 'goal_achieved', 'milestone', 'streak' 
  customMessage,
  autoClose = true,
  duration = 4000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Confetti animation values
  const confettiAnims = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(0),
      translateX: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // Get achievement configuration based on type
  const getAchievementConfig = () => {
    switch (type) {
      case 'goal_achieved':
        return {
          icon: 'trophy',
          iconColor: '#FFD700',
          title: 'Goal Achieved! 🏆',
          subtitle: `Congratulations! You've completed "${goal?.title}"`,
          gradient: ['#FFD700', '#FFA500', '#FF8C00'],
          backgroundColor: '#FFD700',
        };
      case 'milestone':
        return {
          icon: 'star',
          iconColor: '#4CAF50',
          title: 'Milestone Reached! ⭐',
          subtitle: customMessage || 'Great progress on your sustainability journey!',
          gradient: ['#4CAF50', '#45a049', '#3d8b40'],
          backgroundColor: '#4CAF50',
        };
      case 'streak':
        return {
          icon: 'flame',
          iconColor: '#FF6B35',
          title: 'Streak Achievement! 🔥',
          subtitle: customMessage || 'You\'re on fire with sustainable choices!',
          gradient: ['#FF6B35', '#FF5722', '#E64A19'],
          backgroundColor: '#FF6B35',
        };
      default:
        return {
          icon: 'checkmark-circle',
          iconColor: '#4CAF50',
          title: 'Achievement Unlocked! ✨',
          subtitle: customMessage || 'You\'re making great progress!',
          gradient: ['#4CAF50', '#45a049', '#3d8b40'],
          backgroundColor: '#4CAF50',
        };
    }
  };

  const config = getAchievementConfig();

  // Initialize confetti positions
  const initializeConfetti = () => {
    return confettiAnims.map((_, index) => ({
      startX: Math.random() * screenWidth,
      startY: -20,
      endY: screenHeight + 50,
      rotation: Math.random() * 360,
      delay: Math.random() * 1000,
      color: ['#FFD700', '#FF6B35', '#4CAF50', '#2196F3', '#9C27B0'][index % 5],
    }));
  };

  // Start entrance animation
  const startEntranceAnimation = () => {
    // Main achievement animation
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Icon rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Confetti animation
    startConfettiAnimation();
  };

  // Start confetti animation
  const startConfettiAnimation = () => {
    const confettiData = initializeConfetti();
    
    confettiData.forEach((data, index) => {
      const anim = confettiAnims[index];
      
      // Reset positions
      anim.translateY.setValue(data.startY);
      anim.translateX.setValue(data.startX);
      anim.rotate.setValue(0);
      anim.opacity.setValue(1);
      anim.scale.setValue(Math.random() * 0.5 + 0.5);

      // Animate fall
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.translateY, {
            toValue: data.endY,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateX, {
            toValue: data.startX + (Math.random() - 0.5) * 100,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: data.rotation,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ]).start();
      }, data.delay);
    });
  };

  // Start exit animation
  const startExitAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
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
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        startEntranceAnimation();
      }, 100);
      
      // Auto close if enabled
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

  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        {/* Confetti particles */}
        {confettiAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                backgroundColor: initializeConfetti()[index]?.color || '#FFD700',
                transform: [
                  { translateX: anim.translateX },
                  { translateY: anim.translateY },
                  { rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }) },
                  { scale: anim.scale },
                ],
                opacity: anim.opacity,
              }
            ]}
          />
        ))}

        {/* Achievement card */}
        <Animated.View
          style={[
            styles.achievementCard,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
              opacity: opacityAnim,
            }
          ]}
        >
          <LinearGradient
            colors={config.gradient}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Close button */}
            {!autoClose && (
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            )}

            {/* Achievement icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [
                    { rotate: rotateInterpolation },
                    { scale: pulseAnim },
                  ],
                }
              ]}
            >
              <Ionicons 
                name={config.icon} 
                size={80} 
                color="white" 
              />
            </Animated.View>

            {/* Achievement text */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.subtitle}>{config.subtitle}</Text>
            </View>

            {/* Goal details if provided */}
            {goal && (
              <View style={styles.goalDetails}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
                {goal.progress && (
                  <Text style={styles.goalProgress}>
                    {goal.progress.currentPercentage?.toFixed(1)}% completed
                  </Text>
                )}
              </View>
            )}

            {/* Action button */}
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleClose}
            >
              <Text style={styles.actionButtonText}>
                {type === 'goal_achieved' ? 'Celebrate! 🎉' : 'Amazing! ✨'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.l,
  },

  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  achievementCard: {
    width: '90%',
    maxWidth: 350,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.large,
  },

  cardGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },

  closeButton: {
    position: 'absolute',
    top: theme.spacing.m,
    right: theme.spacing.m,
    zIndex: 1,
    padding: theme.spacing.xs,
  },

  iconContainer: {
    marginBottom: theme.spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },

  textContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },

  title: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.s,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  subtitle: {
    fontSize: theme.typography.fontSize.body1,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  goalDetails: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.l,
    alignItems: 'center',
    width: '100%',
  },

  goalTitle: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semibold,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },

  goalProgress: {
    fontSize: theme.typography.fontSize.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },

  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.l,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.xl,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  actionButtonText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semibold,
    color: 'white',
    textAlign: 'center',
  },
});

export default AchievementAnimation;
