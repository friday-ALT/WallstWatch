import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { apiFetch } from '../../constants/api';
import { useLiveQuotes } from '../../hooks/useLiveQuotes';
import { C } from '../../constants/colors';

const MACRO_ITEMS = [
  { label: 'Fed Funds Rate', val: '4.50%', note: 'Target range 4.25–4.50%', color: C.amber },
  { label: 'US 10Y Yield',   val: '4.38%', note: '↑ from 3.9% (Jan)',       color: C.amber },
  { label: 'US 2Y Yield',    val: '4.72%', note: 'Inverted spread: -34bps', color: C.red },
  { label: 'Spread (2s10s)', val: '-34bps', note: 'Recessionary signal',   color: C.red },
  { label: 'CPI (Mar)',      val: '3.2%',  note: 'Above 2% target',        color: C.amber },
  { label: 'PCE (Feb)',      val: '2.8%',  note: 'Fed preferred measure',  color: C.amber },
  { label: 'GDP Q4 2025',    val: '+2.4%', note: 'Annualized SAAR',        color: C.green },
  { label: 'Unemployment',   val: '3.9%',  note: 'Near full employment',   color: C.green },
  { label: 'DXY Index',      val: '104.2', note: 'Dollar strengthening',   color: C.blue },
  { label: 'Gold (XAU)',     val: '$2,312', note: 'Safe haven demand',     color: C.amber },
  { label: 'WTI Crude',      val: '$79.2', note: '↑ on Iran tensions',    color: C.red },
  { label: 'VIX',            val: '18.4',  note: 'Elevated vs 2024 avg',  color: C.amber },
];

export default function MacroScreen() {
  const [news, setNews] = useState<any[]>([]);
  const quotes = useLiveQuotes(['SPY', 'QQQ', 'VIX']);

  useEffect(() => {
    apiFetch<any[]>('/news')
      .then((items) => setNews(items.slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 12, gap: 12 }}>
      <Text style={s.sectionTitle}>MACRO ENVIRONMENT</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>MARKET PULSE</Text>
        {(['SPY', 'QQQ', 'VIX'] as const).map((sym) => {
          const q = quotes[sym];
          const up = q ? q.dp >= 0 : true;
          return (
            <View key={sym} style={s.quoteRow}>
              <Text style={s.quoteSymbol}>{sym}</Text>
              <Text style={[s.quotePrice, { color: up ? C.green : C.red }]}>
                {q ? `$${q.c.toFixed(2)}` : '—'}
              </Text>
              <Text style={[s.quoteChg, { color: up ? C.green : C.red }]}>
                {q ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : ''}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>KEY INDICATORS</Text>
        {MACRO_ITEMS.map((item, i) => (
          <View key={i} style={s.macroRow}>
            <Text style={s.macroLabel}>{item.label}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[s.macroVal, { color: item.color }]}>{item.val}</Text>
            <Text style={s.macroNote}>{item.note}</Text>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>MARKET NEWS</Text>
        {news.length === 0 && <Text style={s.dim}>Loading...</Text>}
        {news.map((item, i) => (
          <TouchableOpacity key={i} style={s.newsItem} onPress={() => item.url && Linking.openURL(item.url)}>
            <Text style={s.newsHeadline}>{item.headline}</Text>
            <Text style={s.newsMeta}>{item.source} · {new Date((item.datetime ?? 0) * 1000).toLocaleTimeString()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDark },
  sectionTitle: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 3, marginBottom: 4 },
  card: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 12, gap: 8 },
  cardTitle: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 2, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 6 },
  quoteRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.border, gap: 8 },
  quoteSymbol: { fontSize: 13, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary, width: 50 },
  quotePrice: { fontSize: 14, fontFamily: 'JetBrainsMono_700Bold', width: 80 },
  quoteChg: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular' },
  macroRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.border + '55', gap: 8 },
  macroLabel: { fontSize: 10, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary, width: 120 },
  macroVal: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', width: 68, textAlign: 'right' },
  macroNote: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, flex: 1 },
  newsItem: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border + '55' },
  newsHeadline: { fontSize: 12, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary, lineHeight: 18, marginBottom: 3 },
  newsMeta: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim },
  dim: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, textAlign: 'center', padding: 12 },
});
