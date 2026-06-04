import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert as RNAlert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLiveQuotes } from '../../hooks/useLiveQuotes';
import { useAlerts } from '../../hooks/useAlerts';
import { SectionLabel } from '../../components/SectionLabel';
import { SurfaceCard } from '../../components/SurfaceCard';
import { F, space, radius } from '../../constants/theme';
import { useScreenPad } from '../../hooks/useScreenPad';
import { useColors } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppColors } from '../../constants/colors';
import {
  ALERT_TYPES,
  AlertType,
  QUICK_SYMBOLS,
  evaluateAlert,
  ruleLabel,
} from '../../utils/alerts';

const makeStyles = (c: AppColors) => ({
  root: { flex: 1, backgroundColor: c.bgDark },
  statsRow: { flexDirection: 'row' as const, gap: space.sm, marginBottom: space.md },
  statBox: { flex: 1, backgroundColor: c.bgCard, borderRadius: radius.lg, padding: space.md, gap: 4 },
  statLabel: { fontFamily: F.sans.regular, fontSize: 12, color: c.textDim },
  statVal: { fontFamily: F.sans.bold, fontSize: 24, color: c.textPrimary },
  banner: {
    backgroundColor: c.red + '18',
    borderRadius: radius.lg,
    padding: space.md,
    marginBottom: space.md,
  },
  bannerText: { fontFamily: F.sans.semibold, fontSize: 15, color: c.red, lineHeight: 20 },
  filterRow: { flexDirection: 'row' as const, gap: space.sm, marginBottom: space.md },
  filterBtn: { borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: c.bgCard },
  filterBtnActive: { backgroundColor: c.textPrimary },
  filterText: { color: c.textSecondary, fontSize: 14, fontFamily: F.sans.semibold },
  filterTextActive: { color: c.bgDark },
  addBtn: {
    backgroundColor: c.textPrimary,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center' as const,
    marginBottom: space.md,
  },
  addBtnText: { color: c.bgDark, fontFamily: F.sans.bold, fontSize: 15 },
  form: { gap: space.md, marginBottom: space.md },
  input: {
    backgroundColor: c.bgPanel,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: F.sans.regular,
    fontSize: 16,
    color: c.textPrimary,
  },
  chipRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: space.sm },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: c.bgPanel },
  chipActive: { backgroundColor: c.red + '28' },
  chipText: { fontFamily: F.sans.semibold, fontSize: 13, color: c.textSecondary },
  chipTextActive: { color: c.red },
  typeRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: space.sm },
  typeBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: c.bgPanel },
  typeBtnActive: { backgroundColor: c.textPrimary },
  typeText: { fontFamily: F.sans.semibold, fontSize: 13, color: c.textSecondary },
  typeTextActive: { color: c.bgDark },
  submitBtn: {
    backgroundColor: c.red,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: 'center' as const,
  },
  submitText: { color: '#fff', fontFamily: F.sans.bold, fontSize: 15 },
  note: { color: c.textSecondary, fontFamily: F.sans.regular, fontSize: 14, lineHeight: 20, marginBottom: space.md },
  signInLink: { color: c.red, fontFamily: F.sans.semibold },
  txRow: { paddingVertical: space.md, gap: space.sm },
  txTop: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  txName: { fontSize: 17, fontFamily: F.sans.bold, color: c.textPrimary, flex: 1 },
  txBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  txBadgeText: { fontSize: 12, fontFamily: F.sans.semibold },
  txRule: { fontFamily: F.sans.regular, fontSize: 14, color: c.textSecondary },
  txStats: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: space.md },
  txStat: { gap: 2, minWidth: 90 },
  txStatLabel: { fontSize: 12, fontFamily: F.sans.regular, color: c.textDim },
  txStatVal: { fontSize: 15, fontFamily: F.sans.semibold, color: c.textPrimary },
  rowActions: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
  deleteText: { fontFamily: F.sans.semibold, fontSize: 14, color: c.red },
  dim: { fontSize: 15, fontFamily: F.sans.regular, color: c.textDim, textAlign: 'center' as const, padding: space.lg },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border },
  eventTime: { fontFamily: F.sans.regular, fontSize: 12, color: c.textDim, marginTop: 4 },
  eventMsg: { fontFamily: F.sans.medium, fontSize: 15, color: c.textPrimary, lineHeight: 20 },
});

export default function AlertsScreen() {
  const router = useRouter();
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const screenPad = useScreenPad({ gap: space.md });
  const { alerts, events, loading, refreshing, refresh, addAlert, toggleAlert, removeAlert, isSynced } =
    useAlerts();

  const [filter, setFilter] = useState<'all' | 'triggered' | 'active'>('all');
  const [showForm, setShowForm] = useState(false);
  const [sym, setSym] = useState('JPM');
  const [alertType, setAlertType] = useState<AlertType>('PRICE_ABOVE');
  const [threshold, setThreshold] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const symbols = useMemo(
    () => Array.from(new Set(alerts.map((a) => a.sym))).filter(Boolean),
    [alerts]
  );
  const quotes = useLiveQuotes(symbols);

  const enriched = useMemo(
    () =>
      alerts.map((a) => {
        const q = quotes[a.sym];
        const hit = evaluateAlert(a, q);
        return { ...a, hit, price: q?.c, move: q?.dp };
      }),
    [alerts, quotes]
  );

  const triggeredCount = enriched.filter((a) => a.hit).length;
  const activeCount = enriched.filter((a) => a.active).length;

  const shown = enriched.filter((a) => {
    if (filter === 'triggered') return a.hit;
    if (filter === 'active') return a.active;
    return true;
  });

  const placeholder =
    ALERT_TYPES.find((t) => t.id === alertType)?.placeholder ?? '0';

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await addAlert(sym, alertType, threshold);
      setThreshold('');
      setShowForm(false);
    } catch (err) {
      RNAlert.alert('Could not create alert', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (id: string, symbol: string) => {
    RNAlert.alert('Delete alert', `Remove ${symbol} alert?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removeAlert(id) },
    ]);
  };

  if (loading) {
    return (
      <View style={[s.root, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.red} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={screenPad}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.red} />
      }
    >
      <SectionLabel subtitle={isSynced ? 'Synced with web · email alerts enabled' : 'Local alerts on this device'}>
        Alerts
      </SectionLabel>

      {!isSynced && (
        <Text style={s.note}>
          <Text style={s.signInLink} onPress={() => router.push('/login')}>
            Sign in
          </Text>{' '}
          to sync alerts with the website and receive email notifications when rules fire.
        </Text>
      )}

      <View style={s.statsRow}>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Active</Text>
          <Text style={[s.statVal, { color: colors.green }]}>{activeCount}</Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Triggered</Text>
          <Text style={[s.statVal, { color: triggeredCount > 0 ? colors.red : colors.textDim }]}>
            {triggeredCount}
          </Text>
        </View>
        <View style={s.statBox}>
          <Text style={s.statLabel}>Total</Text>
          <Text style={s.statVal}>{alerts.length}</Text>
        </View>
      </View>

      {triggeredCount > 0 && (
        <View style={s.banner}>
          <Text style={s.bannerText}>
            {triggeredCount} alert{triggeredCount === 1 ? '' : 's'} triggered right now based on live prices.
          </Text>
        </View>
      )}

      <TouchableOpacity style={s.addBtn} onPress={() => setShowForm((v) => !v)}>
        <Text style={s.addBtnText}>{showForm ? 'Cancel' : '+ New alert'}</Text>
      </TouchableOpacity>

      {showForm && (
        <SurfaceCard style={s.form}>
          <Text style={{ fontFamily: F.sans.semibold, fontSize: 16, color: colors.textPrimary, marginBottom: space.sm }}>
            Create alert
          </Text>

          <TextInput
            value={sym}
            onChangeText={(t) => setSym(t.toUpperCase())}
            placeholder="Symbol"
            placeholderTextColor={colors.textDim}
            style={s.input}
            autoCapitalize="characters"
          />

          <View style={s.chipRow}>
            {QUICK_SYMBOLS.map((q) => (
              <TouchableOpacity
                key={q}
                style={[s.chip, sym === q && s.chipActive]}
                onPress={() => setSym(q)}
              >
                <Text style={[s.chipText, sym === q && s.chipTextActive]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.typeRow}>
            {ALERT_TYPES.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[s.typeBtn, alertType === t.id && s.typeBtnActive]}
                onPress={() => setAlertType(t.id)}
              >
                <Text style={[s.typeText, alertType === t.id && s.typeTextActive]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={threshold}
            onChangeText={setThreshold}
            placeholder={placeholder}
            placeholderTextColor={colors.textDim}
            style={s.input}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity style={s.submitBtn} onPress={handleAdd} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitText}>Save alert</Text>
            )}
          </TouchableOpacity>
        </SurfaceCard>
      )}

      <View style={s.filterRow}>
        {(['all', 'active', 'triggered'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterBtn, filter === f && s.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Triggered'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {shown.length === 0 ? (
        <Text style={s.dim}>
          {filter === 'triggered'
            ? 'No alerts triggered right now.'
            : 'No alerts yet. Tap “New alert” to create one.'}
        </Text>
      ) : (
        <SurfaceCard padded={false}>
          {shown.map((a, i) => {
            const accent = a.hit ? colors.red : a.active ? colors.textSecondary : colors.textDim;
            return (
              <View key={a.id} style={{ paddingHorizontal: space.md }}>
                <View style={s.txRow}>
                  <View style={s.txTop}>
                    <Text style={s.txName}>{a.sym}</Text>
                    <View style={[s.txBadge, { backgroundColor: accent + '22' }]}>
                      <Text style={[s.txBadgeText, { color: accent }]}>
                        {!a.active ? 'Paused' : a.hit ? 'Triggered' : 'Watching'}
                      </Text>
                    </View>
                  </View>
                  <Text style={s.txRule}>{ruleLabel(a)}</Text>
                  <View style={s.txStats}>
                    <View style={s.txStat}>
                      <Text style={s.txStatLabel}>Price</Text>
                      <Text style={s.txStatVal}>{a.price != null ? `$${a.price.toFixed(2)}` : '—'}</Text>
                    </View>
                    <View style={s.txStat}>
                      <Text style={s.txStatLabel}>Move</Text>
                      <Text style={s.txStatVal}>
                        {a.move != null ? `${a.move >= 0 ? '+' : ''}${a.move.toFixed(2)}%` : '—'}
                      </Text>
                    </View>
                    {a.last_fired ? (
                      <View style={s.txStat}>
                        <Text style={s.txStatLabel}>Last fired</Text>
                        <Text style={s.txStatVal}>
                          {new Date(a.last_fired).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={s.rowActions}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontFamily: F.sans.medium, fontSize: 14, color: colors.textSecondary }}>
                        Active
                      </Text>
                      <Switch
                        value={a.active}
                        onValueChange={() => toggleAlert(a.id)}
                        trackColor={{ false: colors.border, true: colors.red + '88' }}
                        thumbColor={a.active ? colors.red : colors.bgPanel}
                      />
                    </View>
                    <TouchableOpacity onPress={() => confirmDelete(a.id, a.sym)}>
                      <Text style={s.deleteText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {i < shown.length - 1 && <View style={s.divider} />}
              </View>
            );
          })}
        </SurfaceCard>
      )}

      {isSynced && events.length > 0 && (
        <View style={{ marginTop: space.lg }}>
          <SectionLabel subtitle="Fired by the server (email sent)">Recent history</SectionLabel>
          <SurfaceCard padded={false}>
            {events.slice(0, 10).map((ev, i) => (
              <View key={ev.id} style={{ paddingHorizontal: space.md }}>
                <View style={{ paddingVertical: space.md }}>
                  <Text style={s.eventMsg}>{ev.message}</Text>
                  <Text style={s.eventTime}>
                    {ev.symbol} · {new Date(ev.created_at).toLocaleString()}
                  </Text>
                </View>
                {i < Math.min(events.length, 10) - 1 && <View style={s.divider} />}
              </View>
            ))}
          </SurfaceCard>
        </View>
      )}
    </ScrollView>
  );
}
