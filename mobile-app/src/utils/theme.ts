import { extendTheme } from 'native-base';

// AI Agent Studio Theme
export const theme = extendTheme({
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main brand blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    // Secondary colors for different AI features
    video: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
    },
    audio: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    code: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
    image: {
      50: '#fefce8',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    // Neutral grays
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    // Success, warning, error states
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  
  fonts: {
    heading: 'Roboto-Bold',
    body: 'Roboto-Regular',
    mono: 'Courier New',
  },
  
  fontSizes: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  
  components: {
    Button: {
      baseStyle: {
        rounded: 'lg',
        _text: {
          fontWeight: 'semibold',
        },
      },
      variants: {
        solid: {
          bg: 'primary.500',
          _pressed: {
            bg: 'primary.600',
          },
          _hover: {
            bg: 'primary.600',
          },
        },
        outline: {
          borderColor: 'primary.500',
          _text: {
            color: 'primary.500',
          },
          _pressed: {
            bg: 'primary.50',
          },
        },
        ghost: {
          _text: {
            color: 'primary.500',
          },
          _pressed: {
            bg: 'primary.50',
          },
        },
        // AI-specific button variants
        video: {
          bg: 'video.500',
          _pressed: {
            bg: 'video.600',
          },
        },
        audio: {
          bg: 'audio.500',
          _pressed: {
            bg: 'audio.600',
          },
        },
        code: {
          bg: 'code.500',
          _pressed: {
            bg: 'code.600',
          },
        },
        image: {
          bg: 'image.500',
          _pressed: {
            bg: 'image.600',
          },
        },
      },
      sizes: {
        sm: {
          px: 3,
          py: 2,
          _text: {
            fontSize: 'sm',
          },
        },
        md: {
          px: 4,
          py: 3,
          _text: {
            fontSize: 'md',
          },
        },
        lg: {
          px: 6,
          py: 4,
          _text: {
            fontSize: 'lg',
          },
        },
      },
    },
    
    Card: {
      baseStyle: {
        bg: 'white',
        rounded: 'xl',
        shadow: 2,
        p: 0,
      },
    },
    
    Input: {
      baseStyle: {
        bg: 'white',
        rounded: 'lg',
        borderColor: 'gray.200',
        _focus: {
          borderColor: 'primary.500',
          bg: 'white',
        },
      },
    },
    
    TextArea: {
      baseStyle: {
        bg: 'white',
        rounded: 'lg',
        borderColor: 'gray.200',
        _focus: {
          borderColor: 'primary.500',
          bg: 'white',
        },
      },
    },
    
    Select: {
      baseStyle: {
        bg: 'white',
        rounded: 'lg',
        borderColor: 'gray.200',
        _focus: {
          borderColor: 'primary.500',
        },
      },
    },
    
    Badge: {
      variants: {
        subtle: {
          bg: 'primary.100',
          _text: {
            color: 'primary.800',
          },
        },
        solid: {
          bg: 'primary.500',
          _text: {
            color: 'white',
          },
        },
        outline: {
          borderColor: 'primary.500',
          _text: {
            color: 'primary.500',
          },
        },
      },
    },
    
    Progress: {
      baseStyle: {
        rounded: 'full',
        bg: 'gray.200',
      },
    },
    
    Alert: {
      variants: {
        'left-accent': {
          container: {
            bg: 'primary.50',
            borderLeftColor: 'primary.500',
            borderLeftWidth: 4,
            rounded: 'lg',
          },
        },
        subtle: {
          container: {
            bg: 'primary.50',
            rounded: 'lg',
          },
        },
      },
    },
  },
  
  config: {
    // Changing disableContainerStyle to false
    useSystemColorMode: false,
    initialColorMode: 'light',
  },
});

// Theme utility functions
export const getAIFeatureColor = (feature: string) => {
  const colors = {
    video: 'video.500',
    audio: 'audio.500', 
    code: 'code.500',
    image: 'image.500',
    app: 'primary.500',
    default: 'primary.500'
  };
  
  return colors[feature as keyof typeof colors] || colors.default;
};

export const getStatusColor = (status: string) => {
  const colors = {
    completed: 'success.500',
    generating: 'primary.500',
    pending: 'warning.500',
    error: 'error.500',
    draft: 'gray.500'
  };
  
  return colors[status as keyof typeof colors] || colors.draft;
};

export const getDeviceOptimizedSizes = (deviceRAM: number) => {
  if (deviceRAM >= 12) {
    // Poco X6 Pro optimization
    return {
      cardPadding: 4,
      buttonSize: 'lg',
      fontSize: 'md',
      iconSize: 24,
      avatarSize: 'lg'
    };
  } else if (deviceRAM >= 8) {
    // Standard mobile devices
    return {
      cardPadding: 3,
      buttonSize: 'md', 
      fontSize: 'sm',
      iconSize: 20,
      avatarSize: 'md'
    };
  } else {
    // Lower-end devices
    return {
      cardPadding: 2,
      buttonSize: 'sm',
      fontSize: 'xs',
      iconSize: 16,
      avatarSize: 'sm'
    };
  }
};

// Animation configurations
export const animations = {
  // Smooth transitions for AI generation
  generation: {
    duration: 300,
    easing: 'ease-in-out',
  },
  // Quick feedback animations
  feedback: {
    duration: 150,
    easing: 'ease-out',
  },
  // Page transitions
  pageTransition: {
    duration: 250,
    easing: 'ease-in-out',
  },
};

// Common shadow styles
export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
};

// Responsive breakpoints
export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1200,
};

export default theme;