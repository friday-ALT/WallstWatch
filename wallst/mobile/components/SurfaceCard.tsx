import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '../context/ThemeContext';
import { radius, space } from '../constants/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
};

export function SurfaceCard({ children, style, padded = true }: Props) {
  const colors = useColors();
  return (
    <View
      style={[
        s.card,
        {
          backgroundColor: colors.bgCard,
        },
        padded && s.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  padded: {
    padding: space.md,
  },
});
