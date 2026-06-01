import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated } from 'react-native';
import { useLiveQuotes } from '../hooks/useLiveQuotes';
import { C } from '../constants/colors';

const SYMBOLS = ['JPM', 'GS', 'MS', 'BAC', 'C', 'WFC', 'SPY', 'QQQ'];

export function TickerBar() {
  const quotes = useLiveQuotes(SYMBOLS);

  return (
    <View style={s.bar}>
      <View style={s.tagBox}><Text style={s.tag}>LIVE</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {SYMBOLS.map((sym) => {
          const q = quotes[sym];
          const up = q ? q.dp >= 0 : true;
          return (
            <View key={sym} style={s.item}>
              <Text style={s.sym}>{sym}</Text>
              <Text style={[s.price, { color: up ? C.green : C.red }]}>
                {q ? `$${q.c.toFixed(2)}` : '—'}
              </Text>
              <Text style={[s.change, { color: up ? C.green : C.red }]}>
                {q ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#080a0d', borderBottomWidth: 1, borderBottomColor: C.border, height: 32 },
  tagBox: { backgroundColor: C.red, paddingHorizontal: 8, height: '100%', justifyContent: 'center' },
  tag: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', color: '#fff', letterSpacing: 2 },
  scroll: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sym: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textSecondary },
  price: { fontSize: 10, fontFamily: 'JetBrainsMono_400Regular' },
  change: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular' },
});
