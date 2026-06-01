import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { apiFetch } from '../../constants/api';
import { C } from '../../constants/colors';

const SYMBOLS = ['JPM', 'GS', 'MS', 'BAC', 'C', 'WFC'];

interface Transaction {
  name: string;
  share: number;
  change: number;
  transactionDate: string;
  transactionCode: string;
  transactionPrice: number;
}

function sentimentColor(buys: number, sells: number) {
  const total = buys + sells;
  if (total === 0) return C.textDim;
  const ratio = buys / total;
  if (ratio >= 0.6) return C.green;
  if (ratio <= 0.4) return C.red;
  return C.amber;
}

export default function InsiderScreen() {
  const [activeSym, setActiveSym] = useState('JPM');
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setData([]);
    apiFetch<{ data: Transaction[] }>(`/insider/${activeSym}`)
      .then((res) => setData(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeSym]);

  const buys = data.filter((t) => ['P'].includes(t.transactionCode)).length;
  const sells = data.filter((t) => ['S'].includes(t.transactionCode)).length;
  const sentColor = sentimentColor(buys, sells);

  return (
    <View style={s.root}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.symBar} contentContainerStyle={s.symBarContent}>
        {SYMBOLS.map((sym) => (
          <TouchableOpacity key={sym} style={[s.symChip, activeSym === sym && s.symActive]} onPress={() => setActiveSym(sym)}>
            <Text style={[s.symText, activeSym === sym && s.symTextActive]}>{sym}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.sentRow}>
        <View style={s.sentBox}>
          <Text style={s.sentLabel}>PURCHASES</Text>
          <Text style={[s.sentVal, { color: C.green }]}>{buys}</Text>
        </View>
        <View style={[s.sentDivider]} />
        <View style={s.sentBox}>
          <Text style={s.sentLabel}>SENTIMENT</Text>
          <Text style={[s.sentVal, { color: sentColor }]}>
            {buys + sells === 0 ? '—' : buys > sells ? '▲ BULLISH' : buys < sells ? '▼ BEARISH' : '◆ NEUTRAL'}
          </Text>
        </View>
        <View style={s.sentDivider} />
        <View style={s.sentBox}>
          <Text style={s.sentLabel}>SALES</Text>
          <Text style={[s.sentVal, { color: C.red }]}>{sells}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 12 }}>
        {loading && <ActivityIndicator color={C.red} style={{ marginTop: 40 }} />}
        {!loading && data.length === 0 && <Text style={s.dim}>No insider transactions found.</Text>}
        {data.slice(0, 30).map((t, i) => {
          const isBuy = ['P'].includes(t.transactionCode);
          const isSell = ['S'].includes(t.transactionCode);
          const color = isBuy ? C.green : isSell ? C.red : C.textDim;
          const label = isBuy ? 'BUY' : isSell ? 'SELL' : t.transactionCode;
          return (
            <View key={i} style={[s.txRow, { borderLeftColor: color }]}>
              <View style={s.txTop}>
                <Text style={s.txName}>{t.name}</Text>
                <View style={[s.txBadge, { backgroundColor: color + '22', borderColor: color }]}>
                  <Text style={[s.txBadgeText, { color }]}>{label}</Text>
                </View>
              </View>
              <View style={s.txStats}>
                <View style={s.txStat}>
                  <Text style={s.txStatLabel}>SHARES</Text>
                  <Text style={s.txStatVal}>{Math.abs(t.change).toLocaleString()}</Text>
                </View>
                <View style={s.txStat}>
                  <Text style={s.txStatLabel}>PRICE</Text>
                  <Text style={s.txStatVal}>{t.transactionPrice ? `$${t.transactionPrice.toFixed(2)}` : '—'}</Text>
                </View>
                <View style={s.txStat}>
                  <Text style={s.txStatLabel}>VALUE</Text>
                  <Text style={s.txStatVal}>
                    {t.transactionPrice && t.change
                      ? `$${(Math.abs(t.change * t.transactionPrice) / 1000).toFixed(0)}K`
                      : '—'}
                  </Text>
                </View>
                <View style={s.txStat}>
                  <Text style={s.txStatLabel}>DATE</Text>
                  <Text style={s.txStatVal}>{t.transactionDate}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDark },
  symBar: { backgroundColor: C.bgPanel, borderBottomWidth: 1, borderBottomColor: C.border },
  symBarContent: { flexDirection: 'row', padding: 8, gap: 6 },
  symChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 2, borderWidth: 1, borderColor: C.border },
  symActive: { backgroundColor: C.red, borderColor: C.red },
  symText: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim },
  symTextActive: { color: '#fff' },
  sentRow: { flexDirection: 'row', backgroundColor: C.bgCard, borderBottomWidth: 1, borderBottomColor: C.border },
  sentBox: { flex: 1, padding: 12, alignItems: 'center', gap: 4 },
  sentDivider: { width: 1, backgroundColor: C.border },
  sentLabel: { fontSize: 8, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 2 },
  sentVal: { fontSize: 14, fontFamily: 'JetBrainsMono_700Bold' },
  txRow: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderLeftWidth: 3, borderRadius: 4, padding: 10, marginBottom: 8, gap: 6 },
  txTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txName: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary, flex: 1 },
  txBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  txBadgeText: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', letterSpacing: 1 },
  txStats: { flexDirection: 'row', gap: 16 },
  txStat: { gap: 2 },
  txStatLabel: { fontSize: 7, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, letterSpacing: 1 },
  txStatVal: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary },
  dim: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, textAlign: 'center', marginTop: 40 },
});
