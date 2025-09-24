/**
 * Eco-Lens Theme Configuration
 * Eco-friendly color palette and design tokens
 */

export const colors = {
  // Primary Colors - Forest/Nature inspired
  primary: '#2E7D32',        // Forest Green
  primaryLight: '#4CAF50',   // Light Green
  primaryDark: '#1B5E20',    // Dark Green
  
  // Secondary Colors
  secondary: '#8BC34A',      // Lime Green
  secondaryLight: '#AED581', // Light Lime
  secondaryDark: '#689F38',  // Dark Lime
  
  // Accent Colors
  accent: '#FFC107',         // Amber (for highlights/CTAs)
  accentLight: '#FFD54F',    // Light Amber
  accentDark: '#FFA000',     // Dark Amber
  
  // Eco-Grade Colors
  gradeA: '#4CAF50',         // Green - Excellent
  gradeB: '#8BC34A',         // Light Green - Very Good
  gradeC: '#CDDC39',         // Lime - Moderate
  gradeD: '#FFEB3B',         // Yellow - Below Average
  gradeE: '#FF9800',         // Orange - Poor
  gradeF: '#F44336',         // Red - Very Poor
  
  // Neutral Colors
  background: '#F5F5F5',     // Light Gray Background
  surface: '#FFFFFF',        // White Surface
  surfaceVariant: '#FAFAFA', // Slightly off-white
  
  // Text Colors
  text: '#212121',           // Almost Black
  textSecondary: '#757575',  // Gray
  textLight: '#9E9E9E',      // Light Gray
  textOnPrimary: '#FFFFFF',  // White text on primary
  
  // Border Colors
  border: '#E0E0E0',         // Light Border
  borderLight: '#F5F5F5',    // Very Light Border
  borderDark: '#BDBDBD',     // Dark Border
  
  // Semantic Colors
  success: '#4CAF50',        // Green
  warning: '#FF9800',        // Orange
  error: '#F44336',          // Red
  info: '#2196F3',           // Blue
  
  // Shadow Colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  
  // Font Sizes
  fontSize: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
    body1: 16,
    body2: 14,
    caption: 12,
    small: 10,
    tiny: 8,
  },
  
  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const borderRadius = {
  none: 0,
  xs: 2,
  s: 4,
  m: 8,
  l: 12,
  xl: 16,
  xxl: 24,
  round: 999,
};

export const shadows = {
  none: {},
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
};

export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Helper function to get eco-grade styles
export const getEcoGradeStyles = (grade) => {
  const gradeStyles = {
    'A': {
      backgroundColor: colors.gradeA,
      color: colors.textOnPrimary,
      label: 'Excellent',
    },
    'B': {
      backgroundColor: colors.gradeB,
      color: colors.textOnPrimary,
      label: 'Very Good',
    },
    'C': {
      backgroundColor: colors.gradeC,
      color: colors.text,
      label: 'Moderate',
    },
    'D': {
      backgroundColor: colors.gradeD,
      color: colors.text,
      label: 'Below Average',
    },
    'E': {
      backgroundColor: colors.gradeE,
      color: colors.textOnPrimary,
      label: 'Poor',
    },
    'F': {
      backgroundColor: colors.gradeF,
      color: colors.textOnPrimary,
      label: 'Very Poor',
    },
  };
  
  return gradeStyles[grade] || {
    backgroundColor: colors.textSecondary,
    color: colors.textOnPrimary,
    label: 'Unknown',
  };
};

// Theme object combining all design tokens
const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  getEcoGradeStyles,
};

export default theme;