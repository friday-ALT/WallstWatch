import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, Modal, Linking,
} from 'react-native';
import { BANKS, Bank } from '../../data/banks';
import { useLiveQuotes } from '../../hooks/useLiveQuotes';
import { C, riskColor } from '../../constants/colors';
import { apiFetch } from '../../constants/api';

const SYMS = BANKS.map((b) => b.sym);

export default function BankMapScreen() {
  const quotes = useLiveQuotes(SYMS);
  const [selected, setSelected] = useState<Bank | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  const open = async (bank: Bank) => {
    setSelected(bank);
    setNews([]);
    setLoadingNews(true);
    try {
      const items = await apiFetch<any[]>(`/news/${bank.sym}`);
      setNews(items.slice(0, 6));
    } catch {}
    setLoadingNews(false);
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.grid}>
      <Text style={s.sectionTitle}>BANKING SECTOR GRID</Text>
      {BANKS.map((b) => {
        const q = quotes[b.sym];
        const live = q ? q.c : parseFloat(b.pr);
        const dp = q ? q.dp : parseFloat(b.ch);
        const up = dp >= 0;
        const rc = riskColor(b.rl);
        return (
          <TouchableOpacity key={b.sym} style={[s.card, { borderColor: rc + '55' }]} onPress={() => open(b)} activeOpacity={0.75}>
            <View style={s.cardTop}>
              <View style={[s.riskBar, { backgroundColor: rc }]} />
              <Text style={s.sym}>{b.sym}</Text>
              <View style={[s.riskBadge, { backgroundColor: rc + '22', borderColor: rc }]}>
                <Text style={[s.riskLabel, { color: rc }]}>{b.rk}</Text>
              </View>
            </View>
            <Text style={s.name}>{b.nm}</Text>
            <View style={s.priceRow}>
              <Text style={[s.price, { color: up ? C.green : C.red }]}>${live.toFixed(2)}</Text>
              <Text style={[s.change, { color: up ? C.green : C.red }]}>{up ? '▲' : '▼'} {Math.abs(dp).toFixed(2)}%</Text>
            </View>
            <View style={s.statsRow}>
              <Stat label="MKT CAP" val={b.mc} />
              <Stat label="CET1" val={b.c1} />
              <Stat label="NI" val={b.ni} />
            </View>
          </TouchableOpacity>
        );
      })}

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalSym}>{selected.sym}</Text>
                <Text style={s.modalName}>{selected.nm}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelected(null)} style={s.closeBtn}>
                <Text style={s.closeText}>✕ CLOSE</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>INTELLIGENCE SIGNALS</Text>
              {selected.sg.map((sg, i) => (
                <View key={i} style={[s.signal, { borderLeftColor: sg.y === 'ok' ? C.green : sg.y === 'warn' ? C.red : C.amber }]}>
                  <Text style={s.signalText}>{sg.t}</Text>
                </View>
              ))}
              <View style={s.quoteBox}>
                <Text style={s.quoteLabel}>ANALYST QUOTE</Text>
                <Text style={s.quoteText}>"{selected.q}"</Text>
              </View>
              <Text style={s.sectionTitle}>LATEST NEWS</Text>
              {loadingNews && <Text style={s.dim}>Loading...</Text>}
              {news.map((item, i) => (
                <TouchableOpacity key={i} style={s.newsItem} onPress={() => item.url && Linking.openURL(item.url)}>
                  <Text style={s.newsHeadline}>{item.headline}</Text>
                  <Text style={s.newsSource}>{item.source} · {item.summary?.slice(0, 80)}...</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
}

function Stat({ label, val }: { label: string; val: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statVal}>{val}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDark },
  grid: { padding: 12, gap: 10 },
  sectionTitle: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 3, marginVertical: 8 },
  card: { backgroundColor: C.bgCard, borderWidth: 1, borderRadius: 4, padding: 12, gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskBar: { width: 3, height: 14, borderRadius: 2 },
  sym: { fontSize: 15, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary, flex: 1 },
  riskBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  riskLabel: { fontSize: 8, fontFamily: 'JetBrainsMono_700Bold', letterSpacing: 1 },
  name: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  price: { fontSize: 18, fontFamily: 'JetBrainsMono_700Bold' },
  change: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular' },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  stat: { gap: 2 },
  statLabel: { fontSize: 8, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, letterSpacing: 1 },
  statVal: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary },
  modal: { flex: 1, backgroundColor: C.bgDark, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, paddingTop: 40 },
  modalSym: { fontSize: 28, fontFamily: 'BebasNeue_400Regular', color: C.textPrimary, letterSpacing: 4 },
  modalName: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary },
  closeBtn: { borderWidth: 1, borderColor: C.red, padding: 8, borderRadius: 2 },
  closeText: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.red },
  signal: { borderLeftWidth: 2, paddingLeft: 10, paddingVertical: 6, marginBottom: 6, backgroundColor: C.bgCard, borderRadius: 2 },
  signalText: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: C.textPrimary },
  quoteBox: { backgroundColor: C.bgPanel, borderLeftWidth: 3, borderLeftColor: C.amber, padding: 12, marginVertical: 12, borderRadius: 2 },
  quoteLabel: { fontSize: 8, fontFamily: 'JetBrainsMono_700Bold', color: C.amber, letterSpacing: 2, marginBottom: 6 },
  quoteText: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: C.textPrimary, lineHeight: 18, fontStyle: 'italic' },
  newsItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
  newsHeadline: { fontSize: 12, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary, marginBottom: 4, lineHeight: 18 },
  newsSource: { fontSize: 10, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary },
  dim: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, textAlign: 'center', padding: 20 },
});
