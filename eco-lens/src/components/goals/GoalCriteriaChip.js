/**
 * GoalCriteriaChip Component
 * A reusable chip component for displaying goal criteria and alignment status
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SustainabilityGoalService from '../../api/sustainabilityGoalService';
import theme from '../../styles/theme';

const GoalCriteriaChip = ({
  goal,
  product,
  isProductMeeting = false,
  size = 'small',
  showIcon = true,
  showStatus = true,
  onPress,
  style,
}) => {
  // Determine chip size
  const chipSizes = {
    small: { 
      paddingHorizontal: 6, 
      paddingVertical: 2, 
      fontSize: theme.typography.fontSize.caption - 1,
      iconSize: 10
    },
    medium: { 
      paddingHorizontal: 8, 
      paddingVertical: 4, 
      fontSize: theme.typography.fontSize.caption,
      iconSize: 12
    },
    large: { 
      paddingHorizontal: 10, 
      paddingVertical: 6, 
      fontSize: theme.typography.fontSize.body,
      iconSize: 14
    },
  };

  const currentSize = chipSizes[size];

  // Get goal type icon
  const getGoalIcon = () => {
    if (!goal?.goalType) return 'target-outline';
    
    switch (goal.goalType) {
      case 'grade_based':
        return 'ribbon-outline';
      case 'score_based':
        return 'speedometer-outline';
      case 'category_based':
        return 'list-outline';
      default:
        return 'target-outline';
    }
  };

  // Get criteria display text
  const getCriteriaText = () => {
    if (!goal?.goalConfig) return 'Goal Criteria';
    
    const config = goal.goalConfig;
    
    switch (goal.goalType) {
      case 'grade_based':
        if (config.targetGrades && config.targetGrades.length > 0) {
          return `${config.targetGrades.join('/')} Grades`;
        }
        return 'Grade Based';
      
      case 'score_based':
        if (config.minimumScore) {
          return `${config.minimumScore}+ Score`;
        }
        return 'Score Based';
      
      case 'category_based':
        if (config.targetCategories && config.targetCategories.length > 0) {
          const categories = config.targetCategories;
          if (categories.length === 1) {
            return categories[0];
          } else if (categories.length <= 2) {
            return categories.join(', ');
          } else {
            return `${categories[0]}+${categories.length - 1}`;
          }
        }
        return 'Category Based';
      
      default:
        return goal.title || 'Sustainability Goal';
    }
  };

  // Get chip colors based on alignment status
  const getChipColors = () => {
    if (isProductMeeting) {
      return {
        backgroundColor: theme.colors.success + '15',
        borderColor: theme.colors.success + '40',
        textColor: theme.colors.success,
        iconColor: theme.colors.success,
      };
    } else {
      return {
        backgroundColor: theme.colors.textSecondary + '10',
        borderColor: theme.colors.textSecondary + '30',
        textColor: theme.colors.textSecondary,
        iconColor: theme.colors.textSecondary,
      };
    }
  };

  // Get alignment status icon
  const getStatusIcon = () => {
    return isProductMeeting ? 'checkmark-circle' : 'close-circle';
  };

  const colors = getChipColors();
  const criteriaText = getCriteriaText();

  const ChipContent = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          paddingHorizontal: currentSize.paddingHorizontal,
          paddingVertical: currentSize.paddingVertical,
        },
        style,
      ]}
    >
      <View style={styles.chipContent}>
        {/* Goal type icon */}
        {showIcon && (
          <Ionicons
            name={getGoalIcon()}
            size={currentSize.iconSize}
            color={colors.iconColor}
            style={styles.chipIcon}
          />
        )}
        
        {/* Criteria text */}
        <Text
          style={[
            styles.chipText,
            {
              color: colors.textColor,
              fontSize: currentSize.fontSize,
            },
          ]}
          numberOfLines={1}
        >
          {criteriaText}
        </Text>
        
        {/* Status icon */}
        {showStatus && (
          <Ionicons
            name={getStatusIcon()}
            size={currentSize.iconSize}
            color={colors.iconColor}
            style={[styles.statusIcon, { marginLeft: 2 }]}
          />
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {ChipContent}
      </TouchableOpacity>
    );
  }

  return ChipContent;
};

// Component for displaying multiple criteria chips
export const GoalCriteriaChipList = ({
  goals = [],
  product,
  maxVisible = 3,
  size = 'small',
  onGoalPress,
  onShowMorePress,
  style,
}) => {
  // Check which goals the product meets using the service
  const goalsWithAlignment = goals.map(goal => {
    // Check if this specific goal is met by the product
    const meetsThisGoal = SustainabilityGoalService.checkProductMeetsGoals(product, [goal]).meetsAnyGoal;
    
    return {
      ...goal,
      isProductMeeting: meetsThisGoal,
    };
  });

  // Sort by alignment status (meeting goals first)
  const sortedGoals = goalsWithAlignment.sort((a, b) => {
    if (a.isProductMeeting && !b.isProductMeeting) return -1;
    if (!a.isProductMeeting && b.isProductMeeting) return 1;
    return 0;
  });

  const visibleGoals = sortedGoals.slice(0, maxVisible);
  const remainingCount = Math.max(0, sortedGoals.length - maxVisible);

  return (
    <View style={[styles.chipList, style]}>
      {visibleGoals.map((goal) => (
        <GoalCriteriaChip
          key={goal._id}
          goal={goal}
          product={product}
          isProductMeeting={goal.isProductMeeting}
          size={size}
          onPress={onGoalPress ? () => onGoalPress(goal) : undefined}
          style={styles.listChip}
        />
      ))}
      
      {remainingCount > 0 && (
        <TouchableOpacity
          style={[
            styles.chip,
            styles.moreChip,
            {
              paddingHorizontal: chipSizes[size].paddingHorizontal,
              paddingVertical: chipSizes[size].paddingVertical,
            },
          ]}
          onPress={onShowMorePress}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              styles.moreChipText,
              { fontSize: chipSizes[size].fontSize },
            ]}
          >
            +{remainingCount}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const chipSizes = {
  small: { 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    fontSize: theme.typography.fontSize.caption - 1,
    iconSize: 10
  },
  medium: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    fontSize: theme.typography.fontSize.caption,
    iconSize: 12
  },
  large: { 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    fontSize: theme.typography.fontSize.body,
    iconSize: 14
  },
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  chipIcon: {
    marginRight: 3,
  },
  
  chipText: {
    fontWeight: theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  
  statusIcon: {
    marginLeft: 2,
  },
  
  // Chip List Styles
  chipList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  
  listChip: {
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  
  moreChip: {
    backgroundColor: theme.colors.primary + '15',
    borderColor: theme.colors.primary + '40',
  },
  
  moreChipText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

export default GoalCriteriaChip;
