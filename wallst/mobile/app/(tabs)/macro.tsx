import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { apiFetch } from '../../constants/api';
import { useLiveQuotes } from '../../hooks/useLiveQuotes';
import { openExternalUrl } from '../../utils/openUrl';
import { SectionLabel } from '../../components/SectionLabel';
import { SurfaceCard } from '../../components/SurfaceCard';
import { ThemeBucketCard } from '../../components/ThemeBucketCard';
import { ALL_THEME_SYMBOLS, MARKET_THEMES } from '../../data/marketThemes';
import { F, space } from '../../constants/theme';
import { useScreenPad } from '../../hooks/useScreenPad';
import { useColors } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppColors } from '../../constants/colors';

const PULSE_SYMS = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIX'] as const;

const makeStyles = (c: AppColors) => ({
  root: { flex: 1, backgroundColor: c.bgDark },
  quoteRow: { flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: space.sm + 2, gap: 8 },
  quoteSymbol: { fontSize: 13, fontFamily: F.mono.bold, color: c.textPrimary, width: 44 },
  quotePrice: { fontSize: 15, fontFamily: F.mono.bold, minWidth: 72, textAlign: 'right' as const },
  quoteChg: { fontSize: 12, fontFamily: F.mono.regular, minWidth: 56, textAlign: 'right' as const },
  newsItem: { paddingVertical: space.md },
  newsHeadline: { fontSize: 16, fontFamily: F.sans.semibold, color: c.textPrimary, lineHeight: 22 },
  newsMeta: { fontSize: 11, fontFamily: F.mono.regular, color: c.textDim, marginTop: 4 },
  dim: { fontSize: 14, fontFamily: F.sans.regular, color: c.textDim, textAlign: 'center' as const, padding: space.md },
  divider: { height: 1, backgroundColor: c.border + '88' },
  sectionGap: { marginTop: space.lg },
});

export default function MacroScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const screenPad = useScreenPad({ gap: space.md, paddingTop: space.sm });
  const [news, setNews] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const quoteSymbols = useMemo(
    () => [...new Set([...ALL_THEME_SYMBOLS, ...PULSE_SYMS])],
    []
  );
  const quotes = useLiveQuotes(quoteSymbols);

  const loadNews = () =>
    apiFetch<any[]>('/news')
      .then((items) => setNews(items.slice(0, 6)))
      .catch(() => {});

  useEffect(() => {
    loadNews();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNews();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={screenPad}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
      }
    >
      <SectionLabel subtitle="CNBC-style thematic watchlists — live prices">
        Market dashboard
      </SectionLabel>

      {MARKET_THEMES.map((theme) => (
        <ThemeBucketCard key={theme.id} theme={theme} quotes={quotes} />
      ))}

      <View style={s.sectionGap}>
        <SectionLabel subtitle="Major US indexes">Index pulse</SectionLabel>
        <SurfaceCard padded={false}>
          <View style={{ paddingHorizontal: space.md }}>
            {PULSE_SYMS.map((sym, i, arr) => {
              const q = quotes[sym];
              const up = (q?.dp ?? 0) >= 0;
              return (
                <View key={sym}>
                  <View style={s.quoteRow}>
                    <Text style={s.quoteSymbol}>{sym}</Text>
                    <View style={{ flex: 1 }} />
                    <Text style={[s.quotePrice, { color: up ? colors.green : colors.red }]}>
                      {q?.c != null ? (sym === 'VIX' ? q.c.toFixed(2) : `$${q.c.toFixed(2)}`) : '—'}
                    </Text>
                    <Text style={[s.quoteChg, { color: up ? colors.green : colors.red }]}>
                      {q?.dp != null ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : ''}
                    </Text>
                  </View>
                  {i < arr.length - 1 && <View style={s.divider} />}
                </View>
              );
            })}
          </View>
        </SurfaceCard>
      </View>

      <View style={s.sectionGap}>
        <SectionLabel>Macro headlines</SectionLabel>
        <SurfaceCard padded={false}>
          <View style={{ paddingHorizontal: space.md }}>
            {news.length === 0 && <Text style={s.dim}>Loading…</Text>}
            {news.map((item, i) => (
              <TouchableOpacity key={i} style={s.newsItem} onPress={() => openExternalUrl(item.url)}>
                <Text style={s.newsHeadline}>{item.headline}</Text>
                <Text style={s.newsMeta}>{item.source}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SurfaceCard>
      </View>
    </ScrollView>
  );
}
