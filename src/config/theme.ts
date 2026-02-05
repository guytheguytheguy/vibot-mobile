/**
 * Theme configuration for Vibot Mobile - AI Memory Palace
 *
 * Defines colors, typography, spacing, and visual design tokens.
 * Deep purple and cosmic aesthetic for a premium, thoughtful experience.
 */

export const colors = {
  // Primary brand colors
  primary: '#6C3CE1',
  primaryLight: '#8B5CF6',
  primaryDark: '#5B21B6',

  // Accent colors
  accent: '#FF6B6B',
  accentLight: '#FF8787',
  accentDark: '#E63946',

  // Success, warning, error
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Backgrounds (dark theme)
  background: '#0A0A1A',
  backgroundSecondary: '#12122A',
  backgroundTertiary: '#1A1A3E',

  // Cards and surfaces
  card: '#1A1A3E',
  cardHover: '#242454',
  surface: '#2A2A5A',

  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B4B4CC',
  textTertiary: '#8080A0',
  textMuted: '#60607A',

  // Borders
  border: '#2A2A5A',
  borderLight: '#3A3A6A',
  borderFocus: '#6C3CE1',

  // Special states
  overlay: 'rgba(10, 10, 26, 0.8)',
  overlayLight: 'rgba(10, 10, 26, 0.6)',
  shadow: 'rgba(0, 0, 0, 0.5)',

  // Gradients
  gradientPrimary: ['#6C3CE1', '#8B5CF6'],
  gradientAccent: ['#FF6B6B', '#FF8787'],
  gradientDark: ['#0A0A1A', '#1A1A3E'],

  // Recording state
  recording: '#EF4444',
  recordingPulse: 'rgba(239, 68, 68, 0.3)',
} as const;

// Room colors for Memory Palace
export const roomColors = {
  cosmic: '#6C3CE1',      // Deep purple
  nebula: '#8B5CF6',      // Light purple
  stellar: '#3B82F6',     // Blue
  aurora: '#10B981',      // Green
  sunset: '#FF6B6B',      // Coral red
  ember: '#F59E0B',       // Amber
  twilight: '#EC4899',    // Pink
  ocean: '#06B6D4',       // Cyan
  forest: '#22C55E',      // Emerald
  lavender: '#A78BFA',    // Lavender
} as const;

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// Animation durations (in ms)
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// Layout constants
export const layout = {
  screenPadding: spacing.md,
  headerHeight: 60,
  tabBarHeight: 80,
  cardSpacing: spacing.md,
  maxContentWidth: 600,
} as const;

// Icon sizes
export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
  '2xl': 64,
} as const;

// Complete theme object
export const theme = {
  colors,
  roomColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  layout,
  iconSize,
} as const;

// Type exports
export type Theme = typeof theme;
export type RoomColor = keyof typeof roomColors;
export type ThemeColor = keyof typeof colors;

export default theme;
