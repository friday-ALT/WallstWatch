import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiFetch } from '../../constants/api';
import { useLiveQuotes } from '../../hooks/useLiveQuotes';
import { openExternalUrl } from '../../utils/openUrl';
import { PulseStrip } from '../../components/PulseStrip';
import { SectionLabel } from '../../components/SectionLabel';
import { SurfaceCard } from '../../components/SurfaceCard';
import { F, space } from '../../constants/theme';
import { useScreenPad } from '../../hooks/useScreenPad';
import { useColors } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppColors } from '../../constants/colors';

interface NewsItem {
  headline: string;
  source: string;
  datetime: number;
  summary?: string;
  url?: string;
}

interface EconEvent {
  event: string;
  date: string;
  impact: string;
  country: string;
}

const PULSE_SYMBOLS = ['SPY', 'QQQ', 'VIX', 'XLF'] as const;

const makeStyles = (c: AppColors) => ({
  root: { flex: 1, backgroundColor: c.bgDark },
  heroKicker: {
    fontFamily: F.sans.semibold,
    fontSize: 13,
    color: c.red,
    marginBottom: space.xs,
  },
  heroHeadline: {
    fontFamily: F.sans.bold,
    fontSize: 24,
    lineHeight: 30,
    color: c.textPrimary,
    letterSpacing: -0.4,
  },
  heroSummary: {
    fontFamily: F.sans.regular,
    fontSize: 15,
    lineHeight: 22,
    color: c.textSecondary,
    marginTop: space.sm,
  },
  heroMeta: {
    fontFamily: F.sans.regular,
    fontSize: 13,
    color: c.textDim,
    marginTop: space.sm,
  },
  eventRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    gap: space.sm,
    paddingVertical: space.sm + 2,
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  eventName: {
    fontFamily: F.sans.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: c.textPrimary,
  },
  eventDate: {
    fontFamily: F.sans.regular,
    fontSize: 13,
    color: c.textDim,
    marginTop: 2,
  },
  newsRow: { paddingVertical: space.md },
  newsHeadline: {
    fontFamily: F.sans.semibold,
    fontSize: 16,
    lineHeight: 22,
    color: c.textPrimary,
  },
  newsMeta: {
    fontFamily: F.sans.regular,
    fontSize: 13,
    color: c.textDim,
    marginTop: space.xs,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border },
  sectionGap: { marginTop: space.lg },
});

export default function TodayScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const screenPad = useScreenPad({ gap: space.lg });
  const [topNews, setTopNews] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EconEvent[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const quotes = useLiveQuotes([...PULSE_SYMBOLS]);

  const load = useCallback(async () => {
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10);
    const [news, cal] = await Promise.all([
      apiFetch<NewsItem[]>('/news').catch(() => [] as NewsItem[]),
      apiFetch<EconEvent[]>(`/economic-calendar?from=${from}&to=${to}`).catch(() => [] as EconEvent[]),
    ]);
    setTopNews(news.slice(0, 8));
    setEvents(cal.filter((e) => e.country === 'US').slice(0, 5));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const topHeadline = topNews[0];
  const pulseItems = useMemo(
    () =>
      PULSE_SYMBOLS.map((symbol) => ({
        symbol,
        price: quotes[symbol]?.c,
        change: quotes[symbol]?.dp,
      })),
    [quotes]
  );

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={screenPad}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
      }
    >
      <SectionLabel subtitle="Markets, news, and your daily brief">{greeting}</SectionLabel>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => openExternalUrl(topHeadline?.url)}
        disabled={!topHeadline?.url}
      >
        <SurfaceCard>
          <Text style={s.heroKicker}>Top story</Text>
          <Text style={s.heroHeadline}>
            {topHeadline?.headline ?? 'Loading market-moving headlines…'}
          </Text>
          {topHeadline?.summary ? (
            <Text style={s.heroSummary} numberOfLines={3}>
              {topHeadline.summary}
            </Text>
          ) : null}
          <Text style={s.heroMeta}>
            {topHeadline
              ? `${topHeadline.source} · ${new Date(topHeadline.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Updating feed'}
          </Text>
        </SurfaceCard>
      </TouchableOpacity>

      <View style={s.sectionGap}>
        <SectionLabel subtitle="Live indices and sector ETFs">Market pulse</SectionLabel>
        <PulseStrip items={pulseItems} />
      </View>

      {events.length > 0 && (
        <View style={s.sectionGap}>
          <SectionLabel subtitle="Upcoming US releases">This week</SectionLabel>
          <SurfaceCard padded={false}>
            {events.map((event, index) => (
              <View key={`${event.event}-${index}`} style={{ paddingHorizontal: space.md }}>
                <View style={s.eventRow}>
                  <View
                    style={[
                      s.dot,
                      {
                        backgroundColor:
                          event.impact === 'high' ? colors.red : event.impact === 'medium' ? colors.amber : colors.blue,
                      },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.eventName}>{event.event}</Text>
                    <Text style={s.eventDate}>{event.date}</Text>
                  </View>
                </View>
                {index < events.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </SurfaceCard>
        </View>
      )}

      {topNews.length > 1 && (
        <View style={s.sectionGap}>
          <SectionLabel>More headlines</SectionLabel>
          <SurfaceCard padded={false}>
            {topNews.slice(1, 7).map((item, index, arr) => (
              <View key={`${item.headline}-${index}`} style={{ paddingHorizontal: space.md }}>
                <TouchableOpacity
                  style={s.newsRow}
                  onPress={() => openExternalUrl(item.url)}
                  activeOpacity={0.7}
                >
                  <Text style={s.newsHeadline}>{item.headline}</Text>
                  <Text style={s.newsMeta}>{item.source}</Text>
                </TouchableOpacity>
                {index < arr.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </SurfaceCard>
        </View>
      )}
    </ScrollView>
  );
}
