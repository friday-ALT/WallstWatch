import { Text } from 'react-native';
import { useColors } from '../context/ThemeContext';
import { F, space } from '../constants/theme';

export function SectionLabel({ children, subtitle }: { children: string; subtitle?: string }) {
  const colors = useColors();
  return (
    <>
      <Text
        style={{
          fontFamily: F.sans.bold,
          fontSize: 22,
          color: colors.textPrimary,
          letterSpacing: -0.3,
          marginBottom: subtitle ? 4 : space.sm,
        }}
      >
        {children}
      </Text>
      {subtitle ? (
        <Text
          style={{
            fontFamily: F.sans.regular,
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: space.sm,
            lineHeight: 20,
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </>
  );
}
