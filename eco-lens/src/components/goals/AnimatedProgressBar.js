/**
 * AnimatedProgressBar Component
 * Smooth animated progress bar for goals with milestone markers
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../../styles/theme';

const AnimatedProgressBar = ({
  progress = 0,
  targetProgress = 100,
  height = 8,
  showMilestones = true,
  showPercentage = true,
  color = theme.colors.primary,
  backgroundColor = theme.colors.border,
  animationDuration = 1000,
  style,
  onMilestoneReached,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const milestoneAnims = useRef([
    new Animated.Value(0), // 25%
    new Animated.Value(0), // 50%
    new Animated.Value(0), // 75%
    new Animated.Value(0), // 90%
  ]).current;

  const milestones = [25, 50, 75, 90];
  const progressPercentage = (progress / targetProgress) * 100;

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: animationDuration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Animate milestones
    milestones.forEach((milestone, index) => {
      if (progressPercentage >= milestone) {
        setTimeout(() => {
          Animated.spring(milestoneAnims[index], {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }).start(() => {
            if (onMilestoneReached) {
              onMilestoneReached(milestone);
            }
          });
        }, (animationDuration * milestone / 100) + (index * 200));
      }
    });
  }, [progress, targetProgress]);

  // Get progress color based on percentage
  const getProgressColor = () => {
    if (progressPercentage >= 90) return '#4CAF50';
    if (progressPercentage >= 75) return '#FF9800';
    if (progressPercentage >= 50) return '#2196F3';
    if (progressPercentage >= 25) return '#9C27B0';
    return color;
  };

  const progressColor = getProgressColor();
  const gradientColors = [progressColor, progressColor + 'CC'];

  return (
    <View style={[styles.container, style]}>
      {/* Progress bar background */}
      <View style={[styles.progressBackground, { height, backgroundColor }]}>
        {/* Animated progress fill */}
        <Animated.View
          style={[
            styles.progressContainer,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
              height,
            }
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>

        {/* Milestone markers */}
        {showMilestones && milestones.map((milestone, index) => (
          <Animated.View
            key={milestone}
            style={[
              styles.milestoneMarker,
              {
                left: `${milestone}%`,
                transform: [
                  { scale: milestoneAnims[index] },
                  { translateX: -6 }, // Center the marker
                ],
              }
            ]}
          >
            <View
              style={[
                styles.milestoneCircle,
                {
                  backgroundColor: progressPercentage >= milestone ? progressColor : backgroundColor,
                  borderColor: progressPercentage >= milestone ? 'white' : theme.colors.textSecondary,
                }
              ]}
            >
              {progressPercentage >= milestone && (
                <Ionicons name="checkmark" size={8} color="white" />
              )}
            </View>
          </Animated.View>
        ))}
      </View>

      {/* Progress percentage */}
      {showPercentage && (
        <View style={styles.percentageContainer}>
          <Animated.Text
            style={[
              styles.percentageText,
              { color: progressColor }
            ]}
          >
            {progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: [0, progressPercentage],
              extrapolate: 'clamp',
            }).interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', `${progressPercentage.toFixed(1)}%`],
            })}
          </Animated.Text>
          <Text style={styles.targetText}>/ {targetProgress}%</Text>
        </View>
      )}

      {/* Milestone labels */}
      {showMilestones && (
        <View style={styles.milestoneLabels}>
          {milestones.map((milestone) => (
            <Text
              key={milestone}
              style={[
                styles.milestoneLabel,
                {
                  left: `${milestone}%`,
                  color: progressPercentage >= milestone ? progressColor : theme.colors.textSecondary,
                  fontWeight: progressPercentage >= milestone ? 'bold' : 'normal',
                }
              ]}
            >
              {milestone}%
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.s,
  },

  progressBackground: {
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },

  progressContainer: {
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressGradient: {
    flex: 1,
  },

  milestoneMarker: {
    position: 'absolute',
    top: -4,
    zIndex: 1,
  },

  milestoneCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },

  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: theme.spacing.xs,
  },

  percentageText: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.bold,
  },

  targetText: {
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.textSecondary,
    marginLeft: 2,
  },

  milestoneLabels: {
    flexDirection: 'row',
    position: 'relative',
    marginTop: theme.spacing.xs,
    height: 16,
  },

  milestoneLabel: {
    position: 'absolute',
    fontSize: theme.typography.fontSize.caption,
    transform: [{ translateX: -10 }], // Center the label
  },
});

export default AnimatedProgressBar;
