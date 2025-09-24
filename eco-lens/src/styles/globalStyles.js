/**
 * Global Styles for Eco-Lens App
 * Common styles used across multiple components
 */

import { StyleSheet } from 'react-native';
import theme from './theme';

const globalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.m,
  },
  
  // Card Styles
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.m,
    marginVertical: theme.spacing.s,
    ...theme.shadows.card,
  },
  
  cardCompact: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.s,
    marginVertical: theme.spacing.xs,
    ...theme.shadows.small,
  },
  
  // Text Styles
  h1: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  
  h2: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  
  h3: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  h4: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  
  body1: {
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.text,
    lineHeight: theme.typography.fontSize.body1 * theme.typography.lineHeight.normal,
  },
  
  body2: {
    fontSize: theme.typography.fontSize.body2,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.body2 * theme.typography.lineHeight.normal,
  },
  
  caption: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.fontSize.caption * theme.typography.lineHeight.normal,
  },
  
  // Button Styles
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  
  buttonText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.small,
  },
  
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.m - 2,
    paddingHorizontal: theme.spacing.l,
    borderRadius: theme.borderRadius.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonOutlineText: {
    color: theme.colors.primary,
    fontSize: theme.typography.fontSize.body1,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  buttonSmall: {
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.s,
  },
  
  // Input Styles
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.m,
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.text,
  },
  
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  
  // Layout Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  column: {
    flexDirection: 'column',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Spacing Styles
  marginXS: {
    margin: theme.spacing.xs,
  },
  
  marginS: {
    margin: theme.spacing.s,
  },
  
  marginM: {
    margin: theme.spacing.m,
  },
  
  marginL: {
    margin: theme.spacing.l,
  },
  
  marginVerticalS: {
    marginVertical: theme.spacing.s,
  },
  
  marginVerticalM: {
    marginVertical: theme.spacing.m,
  },
  
  marginHorizontalS: {
    marginHorizontal: theme.spacing.s,
  },
  
  marginHorizontalM: {
    marginHorizontal: theme.spacing.m,
  },
  
  paddingXS: {
    padding: theme.spacing.xs,
  },
  
  paddingS: {
    padding: theme.spacing.s,
  },
  
  paddingM: {
    padding: theme.spacing.m,
  },
  
  paddingL: {
    padding: theme.spacing.l,
  },
  
  // Badge Styles
  badge: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.s,
    borderRadius: theme.borderRadius.s,
    alignSelf: 'flex-start',
  },
  
  badgeText: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.m,
  },
  
  // Loading & Empty States
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  
  emptyText: {
    fontSize: theme.typography.fontSize.body1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.m,
  },
  
  // Error Styles
  errorContainer: {
    backgroundColor: theme.colors.error,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginVertical: theme.spacing.s,
  },
  
  errorText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body2,
  },
  
  // Success Styles
  successContainer: {
    backgroundColor: theme.colors.success,
    padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    marginVertical: theme.spacing.s,
  },
  
  successText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.typography.fontSize.body2,
  },
  
  // Shadow Presets
  shadowSmall: theme.shadows.small,
  shadowMedium: theme.shadows.medium,
  shadowLarge: theme.shadows.large,
  shadowCard: theme.shadows.card,
  
  // Overlay
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
  },
  
  overlayLight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlayLight,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.m,
  },
  
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.l,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.large,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  
  modalTitle: {
    fontSize: theme.typography.fontSize.h4,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  
  // List Styles
  listItem: {
    paddingVertical: theme.spacing.m,
    paddingHorizontal: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  
  listItemPressed: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  
  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  gridItem: {
    width: '48%',
    marginBottom: theme.spacing.m,
  },
  
  // Eco-specific Styles
  ecoHighlight: {
    backgroundColor: theme.colors.primaryLight,
    opacity: 0.1,
    borderRadius: theme.borderRadius.m,
    padding: theme.spacing.s,
  },
  
  ecoScore: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  
  ecoLabel: {
    fontSize: theme.typography.fontSize.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default globalStyles;