import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { AppColors } from '../constants/colors';
import { useColors } from '../context/ThemeContext';

/** Build StyleSheet from current theme colors (recomputes when theme changes). */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (c: AppColors) => T
): T {
  const colors = useColors();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}

/** Themed divider line color helper */
export function useDividerStyle() {
  const colors = useColors();
  return useMemo(
    () => ({ height: 1 as const, backgroundColor: colors.border + '88' }),
    [colors]
  );
}
