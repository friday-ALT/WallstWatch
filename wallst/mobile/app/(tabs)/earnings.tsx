import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { apiFetch } from '../../constants/api';
import { C } from '../../constants/colors';

interface EarningsItem {
  symbol: string;
  date: string;
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
  quarter: number;
  year: number;
}

function formatAmt(n: number | null) {
  if (n === null || n === undefined) return '—';
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(2)}`;
}

export default function EarningsScreen() {
  const [items, setItems] = useState<EarningsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);
    apiFetch<{ earningsCalendar: EarningsItem[] }>(`/earnings?from=${from}&to=${to}`)
      .then((d) => setItems(d.earningsCalendar ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 12 }}>
      <Text style={s.sectionTitle}>EARNINGS CALENDAR — NEXT 30 DAYS</Text>
      {loading && <ActivityIndicator color={C.red} style={{ marginTop: 40 }} />}
      {!loading && items.length === 0 && (
        <Text style={s.dim}>No earnings data available. Check API key.</Text>
      )}
      {items.slice(0, 40).map((item, i) => {
        const beat = item.epsActual !== null && item.epsEstimate !== null
          ? item.epsActual >= item.epsEstimate : null;
        return (
          <View key={i} style={s.row}>
            <View style={[s.status, { backgroundColor: beat === null ? C.borderGlow : beat ? C.green : C.red }]} />
            <View style={{ flex: 1 }}>
              <View style={s.top}>
                <Text style={s.sym}>{item.symbol}</Text>
                <Text style={s.quarter}>Q{item.quarter} {item.year}</Text>
                <View style={{ flex: 1 }} />
                <Text style={s.date}>{item.date}</Text>
              </View>
              <View style={s.stats}>
                <View style={s.statCol}>
                  <Text style={s.statLabel}>EPS EST</Text>
                  <Text style={s.statVal}>{item.epsEstimate?.toFixed(2) ?? '—'}</Text>
                </View>
                <View style={s.statCol}>
                  <Text style={s.statLabel}>EPS ACT</Text>
                  <Text style={[s.statVal, { color: beat === null ? C.textPrimary : beat ? C.green : C.red }]}>
                    {item.epsActual?.toFixed(2) ?? '—'}
                  </Text>
                </View>
                <View style={s.statCol}>
                  <Text style={s.statLabel}>REV EST</Text>
                  <Text style={s.statVal}>{formatAmt(item.revenueEstimate)}</Text>
                </View>
                <View style={s.statCol}>
                  <Text style={s.statLabel}>REV ACT</Text>
                  <Text style={s.statVal}>{formatAmt(item.revenueActual)}</Text>
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDark },
  sectionTitle: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 3, marginBottom: 10 },
  dim: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, textAlign: 'center', marginTop: 40 },
  row: { flexDirection: 'row', backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 4, marginBottom: 8, overflow: 'hidden', gap: 10, padding: 10 },
  status: { width: 3, borderRadius: 2, alignSelf: 'stretch' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sym: { fontSize: 14, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary },
  quarter: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, backgroundColor: C.bgPanel, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2 },
  date: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary },
  stats: { flexDirection: 'row', gap: 12 },
  statCol: { gap: 2 },
  statLabel: { fontSize: 8, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, letterSpacing: 1 },
  statVal: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary },
});
