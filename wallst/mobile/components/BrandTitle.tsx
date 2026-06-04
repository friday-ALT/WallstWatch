import { Text, TextStyle, StyleProp } from 'react-native';
import { useColors } from '../context/ThemeContext';
import { F } from '../constants/theme';

type Size = 'sm' | 'md' | 'lg' | 'splash';

const sizes: Record<Size, { fontSize: number; letterSpacing: number }> = {
  sm: { fontSize: 18, letterSpacing: 1.5 },
  md: { fontSize: 22, letterSpacing: 2 },
  lg: { fontSize: 32, letterSpacing: 3 },
  splash: { fontSize: 42, letterSpacing: 4 },
};

export function BrandTitle({ size = 'md', style }: { size?: Size; style?: StyleProp<TextStyle> }) {
  const colors = useColors();
  const { fontSize, letterSpacing } = sizes[size];

  return (
    <Text style={style}>
      <Text
        style={{
          fontFamily: F.display,
          fontSize,
          letterSpacing,
          color: colors.textPrimary,
        }}
      >
        WALLST{' '}
      </Text>
      <Text
        style={{
          fontFamily: F.display,
          fontSize,
          letterSpacing,
          color: colors.red,
        }}
      >
        WATCH
      </Text>
    </Text>
  );
}
