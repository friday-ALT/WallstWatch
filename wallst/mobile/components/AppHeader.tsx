import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandTitle } from './BrandTitle';
import { useColors } from '../context/ThemeContext';
import { F, space } from '../constants/theme';

export function AppHeader() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={[s.header, { paddingTop: insets.top + space.sm, backgroundColor: colors.bgDark }]}>
      <BrandTitle size="md" />
      <View style={[s.livePill, { backgroundColor: colors.bgCard }]}>
        <View style={[s.dot, { backgroundColor: colors.green }]} />
        <Text style={[s.liveText, { color: colors.textSecondary }]}>Live</Text>
        <Text style={[s.clock, { color: colors.textDim }]}>{time}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingBottom: space.sm,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 12, fontFamily: F.sans.medium },
  clock: { fontSize: 12, fontFamily: F.mono.bold, marginLeft: 2 },
});
