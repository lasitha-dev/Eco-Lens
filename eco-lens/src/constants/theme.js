/**
 * Comprehensive Theme Configuration for Eco-Lens Admin Dashboard
 * Extends existing color scheme with additional design tokens
 */

import { colors as baseColors } from './colors';

export const colors = {
  ...baseColors,
  // Grade-specific colors for sustainability scoring
  gradeA: '#4CAF50',      // Green - Excellent
  gradeB: '#8BC34A',      // Light Green - Very Good
  gradeC: '#CDDC39',      // Lime - Moderate
  gradeD: '#FFEB3B',      // Yellow - Below Average
  gradeE: '#FF9800',      // Orange - Poor
  gradeF: '#F44336',      // Red - Very Poor
  
  // Extended color palette
  primaryLight: '#81C784',
  primaryDark: '#2E7D32',
  secondaryLight: '#A5D6A7',
  backgroundDark: '#F5F5F5',
  surfaceElevated: '#FFFFFF',
  borderLight: '#EEEEEE',
  textOnPrimary: '#FFFFFF',
  textTertiary: '#9E9E9E',
  
  // Status colors
  online: '#4CAF50',
  offline: '#9E9E9E',
  pending: '#FF9800',
  
  // Admin specific colors
  adminPrimary: '#1B5E20',
  adminSecondary: '#388E3C',
  adminAccent: '#66BB6A',
};

export const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },
  
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
};

export const borderRadius = {
  none: 0,
  xs: 2,
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  small: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  medium: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  
  large: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const layout = {
  container: {
    maxWidth: 1200,
    paddingHorizontal: spacing.m,
  },
  
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.l,
    padding: spacing.m,
    ...shadows.small,
  },
  
  section: {
    marginBottom: spacing.l,
  },
};

// Utility functions for theme
export const getEcoGradeStyles = (grade) => {
  const gradeColors = {
    'A': { backgroundColor: colors.gradeA, textColor: colors.textOnPrimary },
    'B': { backgroundColor: colors.gradeB, textColor: colors.textOnPrimary },
    'C': { backgroundColor: colors.gradeC, textColor: colors.text },
    'D': { backgroundColor: colors.gradeD, textColor: colors.text },
    'E': { backgroundColor: colors.gradeE, textColor: colors.textOnPrimary },
    'F': { backgroundColor: colors.gradeF, textColor: colors.textOnPrimary },
  };
  
  return gradeColors[grade] || { backgroundColor: colors.textSecondary, textColor: colors.textOnPrimary };
};

export const getStatusColor = (status) => {
  const statusColors = {
    'active': colors.online,
    'inactive': colors.offline,
    'pending': colors.pending,
    'success': colors.success,
    'error': colors.error,
    'warning': colors.warning,
    'info': colors.info,
  };
  
  return statusColors[status] || colors.textSecondary;
};

// Component-specific theme presets
export const componentStyles = {
  button: {
    primary: {
      backgroundColor: colors.primary,
      color: colors.textOnPrimary,
      borderRadius: borderRadius.m,
      paddingVertical: spacing.s,
      paddingHorizontal: spacing.m,
      ...shadows.small,
    },
    
    secondary: {
      backgroundColor: colors.surface,
      color: colors.text,
      borderRadius: borderRadius.m,
      paddingVertical: spacing.s,
      paddingHorizontal: spacing.m,
      borderWidth: 1,
      borderColor: colors.border,
    },
    
    danger: {
      backgroundColor: colors.error,
      color: colors.textOnPrimary,
      borderRadius: borderRadius.m,
      paddingVertical: spacing.s,
      paddingHorizontal: spacing.m,
      ...shadows.small,
    },
  },
  
  input: {
    default: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.m,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: spacing.s,
      paddingHorizontal: spacing.m,
      fontSize: typography.fontSize.base,
      color: colors.text,
    },
    
    error: {
      borderColor: colors.error,
      backgroundColor: colors.surface,
    },
    
    focused: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
  },
  
  card: {
    default: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius.l,
      padding: spacing.m,
      ...shadows.small,
    },
    
    elevated: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: borderRadius.l,
      padding: spacing.m,
      ...shadows.medium,
    },
  },
};

// Responsive breakpoints (for future use)
export const breakpoints = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  componentStyles,
  breakpoints,
  animations,
  getEcoGradeStyles,
  getStatusColor,
};
