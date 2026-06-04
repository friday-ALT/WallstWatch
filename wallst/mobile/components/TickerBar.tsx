import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLiveQuotes } from '../hooks/useLiveQuotes';
import { useColors } from '../context/ThemeContext';
import { F, space, radius } from '../constants/theme';

const SYMBOLS = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX', 'XLF', 'JPM', 'GS', 'MS', 'BAC', 'NVDA', 'AAPL'];

export function TickerBar() {
  const colors = useColors();
  const quotes = useLiveQuotes(SYMBOLS);

  return (
    <View style={s.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {SYMBOLS.map((sym) => {
          const q = quotes[sym];
          const up = (q?.dp ?? 0) >= 0;
          return (
            <View key={sym} style={[s.item, { backgroundColor: colors.bgCard }]}>
              <Text style={[s.sym, { color: colors.textSecondary }]}>{sym}</Text>
              <Text style={[s.price, { color: colors.textPrimary }]}>
                {q?.c != null ? q.c.toFixed(2) : '—'}
              </Text>
              <Text style={[s.change, { color: up ? colors.green : colors.red }]}>
                {q?.dp != null ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: space.md, paddingBottom: space.sm },
  scroll: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  sym: { fontSize: 12, fontFamily: F.sans.semibold },
  price: { fontSize: 12, fontFamily: F.mono.bold },
  change: { fontSize: 11, fontFamily: F.sans.medium },
});
