/**
 * 🎨 Advanced Theme System - Professional Mobile Design
 * Optimized for OLED displays (Poco X6 Pro) and various screen sizes
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Color Palette - Inspired by modern AI tools and professional apps
const colors = {
  // Primary AI Brand Colors
  aiPrimary: '#6366F1', // Indigo - Modern AI color
  aiSecondary: '#8B5CF6', // Purple - Creative energy
  aiAccent: '#06B6D4', // Cyan - Technology
  
  // Neural Network Inspired Gradients
  neuralBlue: '#3B82F6',
  neuralPurple: '#8B5CF6',
  neuralPink: '#EC4899',
  neuralOrange: '#F59E0B',
  
  // Dark Theme - OLED Optimized
  dark: {
    background: '#000000', // True black for OLED
    surface: '#0A0A0A',
    surfaceVariant: '#121212',
    card: '#1A1A1A',
    border: '#2A2A2A',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textTertiary: '#666666',
    accent: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4'
  },
  
  // Light Theme - Clean and Professional  
  light: {
    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceVariant: '#F1F5F9',
    card: '#FFFFFF',
    border: '#E2E8F0',
    text: '#0F172A',
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    accent: '#6366F1',
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0891B2'
  }
};

// Typography System - Optimized for mobile readability
const typography = {
  // Font Families
  fonts: {
    primary: Platform.select({
      ios: 'SF Pro Display',
      android: 'Inter',
      default: 'System'
    }),
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'JetBrains Mono',
      default: 'monospace'
    }),
    display: 'SpaceGrotesk-Bold'
  },
  
  // Font Sizes - Responsive to screen size
  sizes: {
    xs: width < 360 ? 10 : 12,
    sm: width < 360 ? 12 : 14,
    base: width < 360 ? 14 : 16,
    lg: width < 360 ? 16 : 18,
    xl: width < 360 ? 18 : 20,
    '2xl': width < 360 ? 20 : 24,
    '3xl': width < 360 ? 24 : 28,
    '4xl': width < 360 ? 28 : 32,
    '5xl': width < 360 ? 32 : 40,
    '6xl': width < 360 ? 40 : 48
  },
  
  // Font Weights
  weights: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800'
  }
};

// Spacing System - Based on 4px grid
const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96
};

// Border Radius System
const borderRadius = {
  none: 0,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999
};

// Shadow System - Enhanced for mobile
const shadows = {
  none: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1
  },
  md: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3
  },
  lg: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  xl: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 8
  },
  '2xl': {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.29,
    shadowRadius: 6.22,
    elevation: 12
  },
  neural: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8
  }
};

// Animation System
const animations = {
  timing: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'spring'
  }
};

// Component Variants
const components = {
  // Button Variants
  button: {
    primary: {
      backgroundColor: colors.aiPrimary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 48
    },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.aiPrimary,
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 48
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 48
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.lg
    }
  },
  
  // Card Variants
  card: {
    default: {
      backgroundColor: colors.light.card,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.md
    },
    elevated: {
      backgroundColor: colors.light.card,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      ...shadows.xl
    },
    neural: {
      backgroundColor: colors.light.card,
      borderRadius: borderRadius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: colors.aiPrimary + '20',
      ...shadows.neural
    }
  },
  
  // Input Variants
  input: {
    default: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontSize: typography.sizes.base,
      minHeight: 48
    },
    large: {
      borderRadius: borderRadius.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.xl,
      fontSize: typography.sizes.lg,
      minHeight: 56
    }
  }
};

// Light Theme Configuration
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.aiPrimary,
    secondary: colors.aiSecondary,
    tertiary: colors.aiAccent,
    surface: colors.light.surface,
    surfaceVariant: colors.light.surfaceVariant,
    background: colors.light.background,
    onBackground: colors.light.text,
    onSurface: colors.light.text,
    onSurfaceVariant: colors.light.textSecondary,
    outline: colors.light.border,
    success: colors.light.success,
    warning: colors.light.warning,
    error: colors.light.error,
    info: colors.light.info
  },
  fonts: {
    ...MD3LightTheme.fonts,
    displayLarge: {
      fontFamily: typography.fonts.display,
      fontSize: typography.sizes['5xl'],
      fontWeight: typography.weights.bold
    },
    displayMedium: {
      fontFamily: typography.fonts.display,
      fontSize: typography.sizes['4xl'],
      fontWeight: typography.weights.bold
    },
    headlineLarge: {
      fontFamily: typography.fonts.primary,
      fontSize: typography.sizes['3xl'],
      fontWeight: typography.weights.semibold
    },
    titleLarge: {
      fontFamily: typography.fonts.primary,
      fontSize: typography.sizes.xl,
      fontWeight: typography.weights.medium
    },
    bodyLarge: {
      fontFamily: typography.fonts.primary,
      fontSize: typography.sizes.base,
      fontWeight: typography.weights.normal
    }
  },
  spacing,
  borderRadius,
  shadows,
  animations,
  components,
  typography
};

// Dark Theme Configuration  
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colors.aiPrimary,
    secondary: colors.aiSecondary,
    tertiary: colors.aiAccent,
    surface: colors.dark.surface,
    surfaceVariant: colors.dark.surfaceVariant,
    background: colors.dark.background,
    onBackground: colors.dark.text,
    onSurface: colors.dark.text,
    onSurfaceVariant: colors.dark.textSecondary,
    outline: colors.dark.border,
    success: colors.dark.success,
    warning: colors.dark.warning,
    error: colors.dark.error,
    info: colors.dark.info
  },
  fonts: theme.fonts,
  spacing,
  borderRadius,
  shadows: {
    ...shadows,
    // Enhanced shadows for dark theme
    md: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 2.22,
      shadowColor: '#000000',
      elevation: 3
    },
    lg: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.6,
      shadowRadius: 3.84,
      shadowColor: '#000000',
      elevation: 5
    }
  },
  animations,
  components: {
    ...components,
    card: {
      default: {
        ...components.card.default,
        backgroundColor: colors.dark.card
      },
      elevated: {
        ...components.card.elevated,
        backgroundColor: colors.dark.card
      },
      neural: {
        ...components.card.neural,
        backgroundColor: colors.dark.card,
        borderColor: colors.aiPrimary + '40'
      }
    }
  },
  typography
};

// Gradient Definitions for Advanced UI
export const gradients = {
  neural: ['#6366F1', '#8B5CF6', '#EC4899'],
  cosmic: ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B'],
  sunset: ['#F59E0B', '#EC4899', '#8B5CF6'],
  ocean: ['#06B6D4', '#3B82F6', '#6366F1'],
  forest: ['#10B981', '#059669', '#047857'],
  
  // AI-themed gradients
  aiPrimary: [colors.aiPrimary, colors.aiSecondary],
  aiSecondary: [colors.aiSecondary, colors.aiAccent],
  aiNeutral: ['#64748B', '#475569'],
  
  // Status gradients
  success: ['#10B981', '#059669'],
  warning: ['#F59E0B', '#D97706'],
  error: ['#EF4444', '#DC2626'],
  info: ['#06B6D4', '#0891B2']
};

// Haptic Feedback Patterns
export const haptics = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'notificationSuccess',
  warning: 'notificationWarning',
  error: 'notificationError',
  selection: 'selectionChanged'
};

// Screen Breakpoints
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280
};

// Device-specific optimizations
export const deviceOptimizations = {
  isSmallScreen: width < breakpoints.sm,
  isMediumScreen: width >= breakpoints.sm && width < breakpoints.md,
  isLargeScreen: width >= breakpoints.md,
  isTablet: width >= breakpoints.md,
  
  // Poco X6 Pro specific (assuming 1080x2400 or similar)
  isPocoX6Pro: width >= 1080 && height >= 2400,
  hasNotch: height > 800, // Rough estimation
  
  // Spacing adjustments based on screen size
  getResponsiveSpacing: (base: number) => {
    if (width < 360) return base * 0.8;
    if (width > 400) return base * 1.1;
    return base;
  },
  
  // Font size adjustments
  getResponsiveFontSize: (base: number) => {
    if (width < 360) return base * 0.9;
    if (width > 400) return base * 1.05;
    return base;
  }
};

// Export theme utilities
export const themeUtils = {
  getColor: (colorPath: string, isDark = false) => {
    const themeColors = isDark ? colors.dark : colors.light;
    return colorPath.split('.').reduce((obj, key) => obj[key], themeColors);
  },
  
  getSpacing: (...values: (keyof typeof spacing)[]) => {
    return values.map(value => spacing[value]);
  },
  
  getShadow: (shadowName: keyof typeof shadows) => {
    return shadows[shadowName];
  },
  
  getGradient: (gradientName: keyof typeof gradients) => {
    return gradients[gradientName];
  },
  
  // Responsive design helpers
  responsive: {
    width: (percentage: number) => (width * percentage) / 100,
    height: (percentage: number) => (height * percentage) / 100,
    min: (value: number) => Math.min(value, width * 0.9),
    max: (value: number) => Math.max(value, width * 0.1)
  }
};

export default theme;