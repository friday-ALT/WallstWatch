import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColors } from '../context/ThemeContext';
import { F, space, radius } from '../constants/theme';

type Item = { symbol: string; price?: number; change?: number };

export function PulseStrip({ items }: { items: Item[] }) {
  const colors = useColors();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {items.map((item) => {
        const up = (item.change ?? 0) >= 0;
        return (
          <View key={item.symbol} style={[s.chip, { backgroundColor: colors.bgCard }]}>
            <Text style={[s.sym, { color: colors.textSecondary }]}>{item.symbol}</Text>
            <Text style={[s.price, { color: colors.textPrimary }]}>
              {item.price != null ? item.price.toFixed(2) : '—'}
            </Text>
            <Text style={[s.chg, { color: up ? colors.green : colors.red }]}>
              {item.change != null ? `${up ? '+' : ''}${item.change.toFixed(2)}%` : ''}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { gap: space.sm, paddingVertical: space.xs },
  chip: {
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    minWidth: 104,
    gap: 4,
  },
  sym: { fontFamily: F.sans.semibold, fontSize: 13 },
  price: { fontFamily: F.mono.bold, fontSize: 18 },
  chg: { fontFamily: F.sans.medium, fontSize: 13 },
});
