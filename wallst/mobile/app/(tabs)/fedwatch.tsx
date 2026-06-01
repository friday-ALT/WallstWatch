import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { apiFetch } from '../../constants/api';
import { C } from '../../constants/colors';

const RATE_HISTORY = [
  { date: 'Mar 2022', rate: '0.25%', action: 'HIKE', note: 'Liftoff from ZLB' },
  { date: 'May 2022', rate: '0.75%', action: 'HIKE', note: '+50bps' },
  { date: 'Jun 2022', rate: '1.50%', action: 'HIKE', note: '+75bps — Aggressive' },
  { date: 'Jul 2022', rate: '2.25%', action: 'HIKE', note: '+75bps' },
  { date: 'Sep 2022', rate: '3.00%', action: 'HIKE', note: '+75bps' },
  { date: 'Nov 2022', rate: '3.75%', action: 'HIKE', note: '+75bps' },
  { date: 'Dec 2022', rate: '4.25%', action: 'HIKE', note: '+50bps' },
  { date: 'Feb 2023', rate: '4.50%', action: 'HIKE', note: '+25bps' },
  { date: 'May 2023', rate: '5.00%', action: 'HIKE', note: '+25bps' },
  { date: 'Jul 2023', rate: '5.25%', action: 'HIKE', note: 'Terminal rate' },
  { date: 'Sep 2024', rate: '5.00%', action: 'CUT', note: '-25bps — Pivot' },
  { date: 'Nov 2024', rate: '4.75%', action: 'CUT', note: '-25bps' },
  { date: 'Dec 2024', rate: '4.50%', action: 'CUT', note: '-25bps — Current' },
];

const FOMC_MEETINGS = [
  { date: 'Jan 28–29 2025', decision: 'HOLD', prob: '97%', note: 'Strong NFP data paused cuts' },
  { date: 'Mar 18–19 2025', decision: 'HOLD', prob: '88%', note: 'Elevated inflation concerns' },
  { date: 'May 6–7 2025',   decision: 'HOLD', prob: '72%', note: 'Tariff uncertainty' },
  { date: 'Jun 17–18 2025', decision: 'CUT?', prob: '55%', note: '25bps cut priced as base case' },
  { date: 'Jul 29–30 2025', decision: '—',    prob: '—',   note: 'Dependent on Jun data' },
  { date: 'Sep 16–17 2025', decision: '—',    prob: '—',   note: '' },
  { date: 'Oct 28–29 2025', decision: '—',    prob: '—',   note: '' },
  { date: 'Dec 9–10 2025',  decision: '—',    prob: '—',   note: '' },
];

interface EconEvent { event: string; date: string; country: string; impact: string; actual?: string; estimate?: string; }

export default function FedWatchScreen() {
  const [calendar, setCalendar] = useState<EconEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date().toISOString().slice(0, 10);
    const to = new Date(Date.now() + 14 * 86400_000).toISOString().slice(0, 10);
    apiFetch<EconEvent[]>(`/economic-calendar?from=${from}&to=${to}`)
      .then((items) => setCalendar((items ?? []).filter((e) => e.country === 'US').slice(0, 20)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 12, gap: 12 }}>
      <Text style={s.sectionTitle}>FED WATCH · MONETARY POLICY</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>CURRENT RATE ENVIRONMENT</Text>
        <View style={s.rateDisplay}>
          <Text style={s.rateValue}>4.50%</Text>
          <Text style={s.rateLabel}>FED FUNDS TARGET RATE</Text>
          <Text style={s.rateRange}>Range: 4.25% – 4.50%</Text>
        </View>
        <View style={s.metaRow}>
          <MetaBlock label="NEXT MEETING" val="May 6–7" />
          <MetaBlock label="CUT PROB" val="28%" color={C.amber} />
          <MetaBlock label="STANCE" val="HOLD" color={C.blue} />
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>2025 FOMC SCHEDULE</Text>
        {FOMC_MEETINGS.map((m, i) => (
          <View key={i} style={s.fomcRow}>
            <View style={[s.fomcDot, {
              backgroundColor: m.decision === 'HOLD' ? C.amber : m.decision === 'CUT?' ? C.green : C.borderGlow
            }]} />
            <View style={{ flex: 1 }}>
              <View style={s.fomcTop}>
                <Text style={s.fomcDate}>{m.date}</Text>
                <View style={{ flex: 1 }} />
                {m.decision !== '—' && (
                  <View style={[s.decBadge, { borderColor: m.decision === 'HOLD' ? C.amber : C.green }]}>
                    <Text style={[s.decText, { color: m.decision === 'HOLD' ? C.amber : C.green }]}>{m.decision}</Text>
                  </View>
                )}
                {m.prob !== '—' && <Text style={s.prob}>{m.prob} prob</Text>}
              </View>
              {m.note ? <Text style={s.fomcNote}>{m.note}</Text> : null}
            </View>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>RATE HISTORY</Text>
        {RATE_HISTORY.map((r, i) => (
          <View key={i} style={s.rateRow}>
            <Text style={s.rateDate}>{r.date}</Text>
            <View style={[s.actionBadge, { borderColor: r.action === 'HIKE' ? C.red : C.green }]}>
              <Text style={[s.actionText, { color: r.action === 'HIKE' ? C.red : C.green }]}>{r.action}</Text>
            </View>
            <Text style={s.rateVal}>{r.rate}</Text>
            <Text style={s.rateNote}>{r.note}</Text>
          </View>
        ))}
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>ECONOMIC CALENDAR — NEXT 14 DAYS (US)</Text>
        {loading && <ActivityIndicator color={C.red} />}
        {!loading && calendar.length === 0 && <Text style={s.dim}>No events found. Check API key.</Text>}
        {calendar.map((e, i) => {
          const impactColor = e.impact === 'high' ? C.red : e.impact === 'medium' ? C.amber : C.textDim;
          return (
            <View key={i} style={s.econRow}>
              <View style={[s.impactDot, { backgroundColor: impactColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.econEvent}>{e.event}</Text>
                <Text style={s.econDate}>{e.date}</Text>
              </View>
              {e.estimate ? <Text style={s.econEst}>Est: {e.estimate}</Text> : null}
              {e.actual ? <Text style={[s.econActual, { color: C.green }]}>Act: {e.actual}</Text> : null}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

function MetaBlock({ label, val, color = C.textPrimary }: { label: string; val: string; color?: string }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <Text style={{ fontSize: 8, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, letterSpacing: 2 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontFamily: 'JetBrainsMono_700Bold', color }}>{val}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDark },
  sectionTitle: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 3, marginBottom: 4 },
  card: { backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 12, gap: 8 },
  cardTitle: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 2, marginBottom: 4, borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 6 },
  rateDisplay: { alignItems: 'center', paddingVertical: 10, gap: 4 },
  rateValue: { fontSize: 42, fontFamily: 'BebasNeue_400Regular', color: C.red, letterSpacing: 4 },
  rateLabel: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 2 },
  rateRange: { fontSize: 10, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  fomcRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border + '44' },
  fomcDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  fomcTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  fomcDate: { fontSize: 10, fontFamily: 'JetBrainsMono_400Regular', color: C.textPrimary },
  fomcNote: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, marginTop: 2 },
  decBadge: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  decText: { fontSize: 9, fontFamily: 'JetBrainsMono_700Bold', letterSpacing: 1 },
  prob: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim },
  rateRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.border + '44' },
  rateDate: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary, width: 70 },
  actionBadge: { borderWidth: 1, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 2 },
  actionText: { fontSize: 8, fontFamily: 'JetBrainsMono_700Bold', letterSpacing: 1 },
  rateVal: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary, width: 45 },
  rateNote: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, flex: 1 },
  econRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border + '44' },
  impactDot: { width: 6, height: 6, borderRadius: 3 },
  econEvent: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.textPrimary },
  econDate: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim },
  econEst: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary },
  econActual: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold' },
  dim: { fontSize: 12, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, textAlign: 'center', padding: 20 },
});
