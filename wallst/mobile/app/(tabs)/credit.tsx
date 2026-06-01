import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { C } from '../../constants/colors';

const PILLARS = [
  {
    title: 'CAPITAL ADEQUACY',
    icon: '◆',
    color: C.green,
    metrics: [
      { label: 'JPM CET1', val: '15.3%', note: '100bps above minimum', ok: true },
      { label: 'GS CET1',  val: '14.8%', note: 'GSIB surcharge applies', ok: true },
      { label: 'BAC CET1', val: '11.9%', note: 'Thinner buffer vs peers', ok: false },
      { label: 'C CET1',   val: '13.4%', note: 'Transformation headwinds', ok: false },
    ],
    summary: 'Big-6 average CET1 at 13.8% — above 2008 levels but stress test outcomes pending.',
  },
  {
    title: 'LIQUIDITY COVERAGE',
    icon: '▲',
    color: C.blue,
    metrics: [
      { label: 'Sector Avg LCR', val: '127%', note: 'Above 100% requirement', ok: true },
      { label: 'JPM LCR',        val: '112%', note: 'Fortress positioning', ok: true },
      { label: 'Short-term debt', val: '$420B', note: 'Refinancing due 2026', ok: false },
      { label: 'Fed Facility',   val: 'ACTIVE', note: 'BTFP legacy exposure', ok: true },
    ],
    summary: 'Liquidity ratios healthy at aggregate level; idiosyncratic risks remain at WFC/BAC.',
  },
  {
    title: 'ASSET QUALITY',
    icon: '⬛',
    color: C.amber,
    metrics: [
      { label: 'CRE Delinquency', val: '4.2%', note: 'Office default spike', ok: false },
      { label: 'Consumer NPL',    val: '1.8%', note: 'Normalizing post-COVID', ok: true },
      { label: 'Credit Card DQ',  val: '2.9%', note: 'Rising — watch BAC/C', ok: false },
      { label: 'IG Corp Spreads', val: '+95bps', note: 'Tighter than 2023', ok: true },
    ],
    summary: 'CRE office exposure remains the primary structural vulnerability across US banks.',
  },
  {
    title: 'SYSTEMIC RISK SCORE',
    icon: '◈',
    color: C.purple,
    metrics: [
      { label: 'SRISK Aggregate', val: '$1.4T', note: 'Capital shortfall in tail', ok: false },
      { label: 'Interconnectedness', val: 'HIGH', note: 'JPM/GS network hubs', ok: false },
      { label: 'DFAST Result 2025', val: 'ALL PASS', note: 'Adverse scenario', ok: true },
      { label: 'Basel III Endgame', val: 'DELAYED', note: 'Reg relief expected', ok: true },
    ],
    summary: 'Systemic indicators show elevated but contained risk. Fed stress tests remain the key annual checkpoint.',
  },
];

export default function CreditScreen() {
  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 12, gap: 12 }}>
      <Text style={s.sectionTitle}>CREDIT SYSTEM HEALTH</Text>
      <View style={s.alertBox}>
        <Text style={s.alertLabel}>◆ SYSTEM STATUS: ELEVATED VIGILANCE</Text>
        <Text style={s.alertDesc}>
          Office CRE + consumer credit normalization create dual pressure. No systemic event imminent. Monitor CRE quarterly.
        </Text>
      </View>
      {PILLARS.map((p) => (
        <View key={p.title} style={[s.pillar, { borderColor: p.color + '44' }]}>
          <View style={s.pillarHeader}>
            <View style={[s.iconBox, { backgroundColor: p.color + '22', borderColor: p.color }]}>
              <Text style={[s.icon, { color: p.color }]}>{p.icon}</Text>
            </View>
            <Text style={[s.pillarTitle, { color: p.color }]}>{p.title}</Text>
          </View>
          {p.metrics.map((m, i) => (
            <View key={i} style={s.metricRow}>
              <View style={[s.dot, { backgroundColor: m.ok ? C.green : C.red }]} />
              <Text style={s.metricLabel}>{m.label}</Text>
              <View style={{ flex: 1 }} />
              <Text style={[s.metricVal, { color: m.ok ? C.green : C.red }]}>{m.val}</Text>
              <Text style={s.metricNote}>{m.note}</Text>
            </View>
          ))}
          <Text style={s.summary}>{p.summary}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bgDark },
  sectionTitle: { fontSize: 10, fontFamily: 'JetBrainsMono_700Bold', color: C.textDim, letterSpacing: 3, marginBottom: 4 },
  alertBox: { backgroundColor: '#ff1744' + '15', borderWidth: 1, borderColor: '#ff1744' + '55', padding: 12, borderRadius: 4 },
  alertLabel: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', color: C.red, letterSpacing: 1, marginBottom: 6 },
  alertDesc: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: C.textPrimary, lineHeight: 18 },
  pillar: { backgroundColor: C.bgCard, borderWidth: 1, borderRadius: 4, padding: 12, gap: 8 },
  pillarHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  iconBox: { width: 28, height: 28, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 14, fontFamily: 'JetBrainsMono_700Bold' },
  pillarTitle: { fontSize: 13, fontFamily: 'JetBrainsMono_700Bold', letterSpacing: 1 },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  metricLabel: { fontSize: 10, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary, width: 110 },
  metricVal: { fontSize: 11, fontFamily: 'JetBrainsMono_700Bold', width: 70, textAlign: 'right' },
  metricNote: { fontSize: 9, fontFamily: 'JetBrainsMono_400Regular', color: C.textDim, flex: 1 },
  summary: { fontSize: 11, fontFamily: 'JetBrainsMono_400Regular', color: C.textSecondary, lineHeight: 17, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 8, marginTop: 4 },
});
