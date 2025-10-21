/**
 * GoalProgressCard Component
 * A reusable card component displaying goal progress with circular indicator
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../styles/theme';

// Simple circular progress using View components
const CircularProgress = ({ 
  percentage, 
  size = 70, 
  strokeWidth = 4, 
  color = theme.colors.primary,
  backgroundColor = theme.colors.border 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.circularProgressContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.circularProgressBackground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: backgroundColor,
          },
        ]}
      />
      
      {/* Progress circle - simplified approach using border */}
      <View
        style={[
          styles.circularProgressForeground,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderTopColor: color,
            borderRightColor: percentage > 25 ? color : backgroundColor,
            borderBottomColor: percentage > 50 ? color : backgroundColor,
            borderLeftColor: percentage > 75 ? color : backgroundColor,
            transform: [{ rotate: '-90deg' }],
          },
        ]}
      />
      
      {/* Center content */}
      <View style={styles.circularProgressCenter}>
        <Text style={[styles.percentageText, { color }]}>
          {Math.round(percentage)}%
        </Text>
      </View>
    </View>
  );
};

const GoalProgressCard = ({
  goal,
  onPress,
  size = 'medium',
  showDetails = true,
  animated = true,
  style,
}) => {
  // Determine card size
  const cardSizes = {
    small: { width: 120, height: 140, progressSize: 50 },
    medium: { width: 160, height: 180, progressSize: 70 },
    large: { width: 200, height: 220, progressSize: 90 },
  };

  const currentSize = cardSizes[size];

  // Calculate progress values
  const progress = goal?.progress || {};
  const percentage = progress.currentPercentage || 0;
  const isAchieved = goal?.isAchieved || false;
  const progressStatus = goal?.progressStatus || 'not_started';

  // Get progress color based on status
  const getProgressColor = () => {
    if (isAchieved) return theme.colors.success;
    if (percentage >= 75) return theme.colors.success;
    if (percentage >= 50) return theme.colors.warning;
    if (percentage >= 25) return '#FF9800';
    return theme.colors.error;
  };

  // Get goal type icon
  const getGoalIcon = () => {
    if (!goal?.goalType) return 'flag-outline';
    
    switch (goal.goalType) {
      case 'grade_based':
        return 'ribbon-outline';
      case 'score_based':
        return 'speedometer-outline';
      case 'category_based':
        return 'list-outline';
      default:
        return 'flag-outline';
    }
  };

  // Get goal type display text
  const getGoalTypeText = () => {
    if (!goal?.goalType) return 'Goal';
    
    switch (goal.goalType) {
      case 'grade_based':
        return 'Grade Goal';
      case 'score_based':
        return 'Score Goal';
      case 'category_based':
        return 'Category Goal';
      default:
        return 'Sustainability Goal';
    }
  };

  // Get progress description
  const getProgressDescription = () => {
    if (isAchieved) return 'Completed! 🎉';
    if (progress.totalPurchases === 0) return 'No purchases yet';
    return `${progress.goalMetPurchases || 0}/${progress.totalPurchases} purchases`;
  };

  const progressColor = getProgressColor();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { 
          width: currentSize.width, 
          height: currentSize.height,
          borderColor: isAchieved ? theme.colors.success : theme.colors.border,
          borderWidth: isAchieved ? 2 : 1,
        },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Achievement badge */}
      {isAchieved && (
        <View style={styles.achievementBadge}>
          <Ionicons name="trophy" size={12} color={theme.colors.success} />
        </View>
      )}

      {/* Circular Progress Indicator */}
      <View style={styles.progressContainer}>
        <CircularProgress
          percentage={percentage}
          size={currentSize.progressSize}
          color={progressColor}
        />
        
        {/* Goal type icon */}
        <View style={styles.goalIconContainer}>
          <Ionicons 
            name={getGoalIcon()} 
            size={size === 'small' ? 12 : 14} 
            color={theme.colors.textSecondary} 
          />
        </View>
      </View>

      {/* Goal details */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.goalTitle} numberOfLines={2}>
            {goal?.title || 'Sustainability Goal'}
          </Text>
          
          <Text style={styles.goalType}>
            {getGoalTypeText()}
          </Text>
          
          <Text style={styles.progressDescription}>
            {getProgressDescription()}
          </Text>
          
          {/* Goal status indicator */}
          <View style={[
            styles.statusIndicator,
            { backgroundColor: progressColor + '20' }
          ]}>
            <Text style={[styles.statusText, { color: progressColor }]}>
              {isAchieved ? 'Achieved' : progressStatus.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginRight: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.medium,
    position: 'relative',
  },
  
  achievementBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.success + '20',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  
  progressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  // Circular Progress Styles
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  
  circularProgressBackground: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  
  circularProgressForeground: {
    position: 'absolute',
    backgroundColor: 'transparent',
    borderTopColor: theme.colors.primary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  
  circularProgressCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  percentageText: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.bold,
    textAlign: 'center',
  },
  
  goalIconContainer: {
    position: 'absolute',
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  detailsContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.s,
    flex: 1,
    justifyContent: 'space-between',
  },
  
  goalTitle: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  goalType: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  progressDescription: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  
  statusIndicator: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.s,
    marginTop: theme.spacing.xs,
  },
  
  statusText: {
    fontSize: theme.typography.fontSize.caption - 1,
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
});

export default GoalProgressCard;
