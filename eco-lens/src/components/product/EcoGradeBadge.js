/**
 * EcoGradeBadge Component
 * Displays the sustainability grade (A-F) with appropriate colors
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../styles/theme';

const EcoGradeBadge = ({ 
  grade, 
  size = 'medium', 
  showLabel = false,
  style 
}) => {
  const gradeStyles = theme.getEcoGradeStyles(grade);
  const sizeStyles = styles[size] || styles.medium;
  
  return (
    <View 
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: gradeStyles.backgroundColor },
        style
      ]}
    >
      <Text 
        style={[
          styles.gradeText,
          sizeStyles.text,
          { color: gradeStyles.color }
        ]}
      >
        {grade}
      </Text>
      {showLabel && (
        <Text 
          style={[
            styles.labelText,
            sizeStyles.label,
            { color: gradeStyles.color }
          ]}
        >
          {gradeStyles.label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.m,
    ...theme.shadows.small,
  },
  
  gradeText: {
    fontWeight: theme.typography.fontWeight.bold,
  },
  
  labelText: {
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
  },
  
  // Size variations
  small: {
    container: {
      paddingHorizontal: theme.spacing.s,
      paddingVertical: theme.spacing.xs,
      minWidth: 28,
      minHeight: 28,
    },
    text: {
      fontSize: theme.typography.fontSize.body2,
    },
    label: {
      fontSize: theme.typography.fontSize.tiny,
    },
  },
  
  medium: {
    container: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      minWidth: 40,
      minHeight: 40,
    },
    text: {
      fontSize: theme.typography.fontSize.h5,
    },
    label: {
      fontSize: theme.typography.fontSize.small,
    },
  },
  
  large: {
    container: {
      paddingHorizontal: theme.spacing.l,
      paddingVertical: theme.spacing.m,
      minWidth: 60,
      minHeight: 60,
    },
    text: {
      fontSize: theme.typography.fontSize.h2,
    },
    label: {
      fontSize: theme.typography.fontSize.caption,
    },
  },
  
  xlarge: {
    container: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.l,
      minWidth: 80,
      minHeight: 80,
    },
    text: {
      fontSize: theme.typography.fontSize.h1,
    },
    label: {
      fontSize: theme.typography.fontSize.body2,
    },
  },
});

export default EcoGradeBadge;