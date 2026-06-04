import { View, Text, StyleSheet } from 'react-native';
import type { Quote } from '../hooks/useLiveQuotes';
import { useColors } from '../context/ThemeContext';
import { F, space, radius } from '../constants/theme';
import type { MarketTheme } from '../data/marketThemes';

function fmtPrice(sym: string, c?: number) {
  if (c == null) return '—';
  if (sym === 'VIX') return c.toFixed(2);
  return `$${c.toFixed(2)}`;
}

export function ThemeBucketCard({
  theme,
  quotes,
}: {
  theme: MarketTheme;
  quotes: Record<string, Quote>;
}) {
  const colors = useColors();

  return (
    <View style={[s.card, { backgroundColor: colors.bgCard }]}>
      <Text style={[s.title, { color: colors.textPrimary }]}>{theme.title}</Text>
      <Text style={[s.sub, { color: colors.textDim }]}>{theme.subtitle}</Text>

      <View style={[s.headerRow, { borderBottomColor: colors.border }]}>
        <Text style={[s.colHead, { flex: 1, color: colors.textDim }]}>Symbol</Text>
        <Text style={[s.colHead, s.colLast, { color: colors.textDim }]}>Last</Text>
        <Text style={[s.colHead, s.colChg, { color: colors.textDim }]}>Chg</Text>
        <Text style={[s.colHead, s.colPct, { color: colors.textDim }]}>%</Text>
      </View>

      {theme.symbols.map((item, i) => {
        const q = quotes[item.sym];
        const up = (q?.dp ?? 0) >= 0;
        const tint = up ? colors.green : colors.red;
        return (
          <View
            key={item.sym}
            style={[
              s.row,
              i < theme.symbols.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.sym, { color: colors.textPrimary }]}>{item.sym}</Text>
              <Text style={[s.label, { color: colors.textDim }]} numberOfLines={1}>
                {item.label}
              </Text>
            </View>
            <Text style={[s.last, { color: colors.textPrimary }]}>{fmtPrice(item.sym, q?.c)}</Text>
            <Text style={[s.chg, { color: tint }]}>
              {q?.d != null ? `${up ? '+' : ''}${q.d.toFixed(2)}` : '—'}
            </Text>
            <Text style={[s.pct, { color: tint }]}>
              {q?.dp != null ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : '—'}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
  },
  title: {
    fontFamily: F.sans.bold,
    fontSize: 17,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  sub: {
    fontFamily: F.sans.regular,
    fontSize: 13,
    marginBottom: space.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colHead: {
    fontFamily: F.sans.semibold,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  colLast: { width: 72, textAlign: 'right' },
  colChg: { width: 56, textAlign: 'right' },
  colPct: { width: 58, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  sym: { fontFamily: F.mono.bold, fontSize: 14 },
  label: { fontFamily: F.sans.regular, fontSize: 11, marginTop: 1 },
  last: { fontFamily: F.mono.bold, fontSize: 14, width: 72, textAlign: 'right' },
  chg: { fontFamily: F.sans.medium, fontSize: 12, width: 56, textAlign: 'right' },
  pct: { fontFamily: F.sans.semibold, fontSize: 12, width: 58, textAlign: 'right' },
});
