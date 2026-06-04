import { Platform, TextStyle, ViewStyle } from 'react-native';
import { darkColors, AppColors } from './colors';

/** Typography: sans for reading, mono for market data */
export const F = {
  sans: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  mono: {
    regular: 'JetBrainsMono_400Regular',
    bold: 'JetBrainsMono_700Bold',
  },
  display: 'BebasNeue_400Regular',
  system: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export function sectionLabelStyle(c: AppColors): TextStyle {
  return {
    fontFamily: F.sans.bold,
    fontSize: 22,
    color: c.textPrimary,
    letterSpacing: -0.3,
    marginBottom: space.sm,
  };
}

export const screenPad: ViewStyle = {
  paddingHorizontal: space.md,
  paddingBottom: space.lg,
};

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };
