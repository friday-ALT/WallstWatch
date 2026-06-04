import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiFetch } from '../../constants/api';
import { openExternalUrl } from '../../utils/openUrl';
import { SectionLabel } from '../../components/SectionLabel';
import { SurfaceCard } from '../../components/SurfaceCard';
import { F, space, hitSlop, radius } from '../../constants/theme';
import { useScreenPad } from '../../hooks/useScreenPad';
import { useColors } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppColors } from '../../constants/colors';

interface NewsItem {
  headline: string;
  source: string;
  datetime: number;
  url?: string;
}

const FILTERS = ['TOP', 'BANKS', 'MACRO', 'JPM', 'GS', 'MS', 'BAC'] as const;

const makeStyles = (c: AppColors) => ({
  root: { flex: 1, backgroundColor: c.bgDark },
  filterBar: { flexGrow: 0 },
  filterContent: {
    flexDirection: 'row' as const,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    gap: space.sm,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: c.bgCard,
  },
  chipActive: { backgroundColor: c.textPrimary },
  chipText: {
    fontFamily: F.sans.semibold,
    fontSize: 14,
    color: c.textSecondary,
  },
  chipTextActive: { color: c.bgDark },
  feed: { flex: 1 },
  story: { paddingVertical: space.md },
  storyHeadline: {
    fontFamily: F.sans.semibold,
    fontSize: 17,
    lineHeight: 24,
    color: c.textPrimary,
    marginBottom: space.xs,
  },
  storyMeta: {
    fontFamily: F.sans.regular,
    fontSize: 13,
    color: c.textDim,
  },
  dim: {
    fontFamily: F.sans.regular,
    fontSize: 14,
    color: c.textDim,
    textAlign: 'center' as const,
    marginTop: space.lg,
  },
  divider: { height: 1, backgroundColor: c.border + '88' },
});

export default function NewsScreen() {
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const screenPad = useScreenPad();
  const [active, setActive] = useState<(typeof FILTERS)[number]>('TOP');
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const route =
      active === 'TOP' || active === 'BANKS' || active === 'MACRO'
        ? '/news'
        : `/news/${active}`;
    const rows = await apiFetch<NewsItem[]>(route).catch(() => [] as NewsItem[]);
    if (active === 'MACRO') {
      setItems(
        rows.filter((n) => /fed|rate|inflation|bond|yield|macro|treasury/i.test(n.headline)).slice(0, 40)
      );
      return;
    }
    setItems(rows.slice(0, 40));
  }, [active]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <View style={s.root}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterBar}
        contentContainerStyle={s.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.chip, active === f && s.chipActive]}
            onPress={() => setActive(f)}
            hitSlop={hitSlop}
          >
            <Text style={[s.chipText, active === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={s.feed}
        contentContainerStyle={screenPad}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.red} />
        }
      >
        {loading && !refreshing && <Text style={s.dim}>Loading…</Text>}
        {!loading && items.length === 0 && <Text style={s.dim}>No stories for this filter.</Text>}
        {items.length > 0 && (
          <SurfaceCard padded={false}>
            {items.map((item, idx, arr) => (
              <View key={`${item.headline}-${idx}`} style={{ paddingHorizontal: space.md }}>
                <TouchableOpacity
                  style={s.story}
                  onPress={() => openExternalUrl(item.url)}
                  activeOpacity={0.7}
                >
                  <Text style={s.storyHeadline}>{item.headline}</Text>
                  <Text style={s.storyMeta}>
                    {item.source}
                    {item.datetime
                      ? ` · ${new Date(item.datetime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      : ''}
                  </Text>
                </TouchableOpacity>
                {idx < arr.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </SurfaceCard>
        )}
      </ScrollView>
    </View>
  );
}
