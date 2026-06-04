import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLiveQuotes } from '../../hooks/useLiveQuotes';
import { useAuth } from '../../context/AuthContext';
import { SectionLabel } from '../../components/SectionLabel';
import { SurfaceCard } from '../../components/SurfaceCard';
import { F, space, radius } from '../../constants/theme';
import { useScreenPad } from '../../hooks/useScreenPad';
import { useColors } from '../../context/ThemeContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppColors } from '../../constants/colors';

const DEFAULT_WATCHLIST = ['SPY', 'QQQ', 'VIX', 'JPM', 'GS', 'MS', 'BAC', 'NVDA', 'XLF'];

const makeStyles = (c: AppColors) => ({
  root: { flex: 1, backgroundColor: c.bgDark },
  inputRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: space.sm, marginBottom: space.md },
  input: {
    flex: 1,
    backgroundColor: c.bgPanel,
    color: c.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.pill,
    fontFamily: F.sans.medium,
    fontSize: 15,
  },
  addBtn: {
    backgroundColor: c.textPrimary,
    borderRadius: radius.pill,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  addBtnText: { color: c.bgDark, fontFamily: F.sans.bold, fontSize: 15 },
  dim: { fontSize: 15, fontFamily: F.sans.regular, color: c.textDim, textAlign: 'center' as const, padding: space.lg },
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: space.sm,
    paddingVertical: space.md,
  },
  symCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  symText: { fontSize: 13, fontFamily: F.sans.bold, color: '#fff' },
  sym: { fontSize: 17, fontFamily: F.sans.bold, color: c.textPrimary },
  price: { fontSize: 17, fontFamily: F.mono.bold, minWidth: 88, textAlign: 'right' as const },
  change: { fontSize: 14, fontFamily: F.sans.medium, minWidth: 64, textAlign: 'right' as const },
  date: { fontSize: 13, fontFamily: F.sans.regular, color: c.textDim, marginTop: 2 },
  removeBtn: { justifyContent: 'center' as const, paddingHorizontal: 8, minHeight: 44 },
  removeText: { color: c.textDim, fontFamily: F.sans.medium, fontSize: 20 },
  signInLink: { color: c.red, fontFamily: F.sans.semibold },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border },
});

export default function WatchlistScreen() {
  const router = useRouter();
  const colors = useColors();
  const s = useThemedStyles(makeStyles);
  const screenPad = useScreenPad({ gap: space.md });
  const { token, fetchWatchlist, addWatchSymbol, removeWatchSymbol } = useAuth();
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST);
  const [draft, setDraft] = useState('');
  const [syncing, setSyncing] = useState(false);
  const quotes = useLiveQuotes(symbols);

  const loadFromServer = useCallback(async () => {
    if (!token) {
      setSymbols(DEFAULT_WATCHLIST);
      return;
    }
    setSyncing(true);
    try {
      const rows = await fetchWatchlist();
      const syms = rows.map((r) => r.symbol.toUpperCase()).filter(Boolean);
      if (syms.length > 0) setSymbols(syms);
    } catch {
      /* keep current list */
    } finally {
      setSyncing(false);
    }
  }, [token, fetchWatchlist]);

  useEffect(() => {
    loadFromServer();
  }, [loadFromServer]);

  const addSymbol = async () => {
    const next = draft.trim().toUpperCase();
    if (!next || symbols.includes(next)) return;
    if (token) {
      setSyncing(true);
      try {
        const rows = await addWatchSymbol(next);
        setSymbols(rows.map((r) => r.symbol.toUpperCase()));
        setDraft('');
      } catch {
        setSymbols((prev) => [next, ...prev].slice(0, 16));
        setDraft('');
      } finally {
        setSyncing(false);
      }
    } else {
      setSymbols((prev) => [next, ...prev].slice(0, 16));
      setDraft('');
    }
  };

  const removeSymbol = async (symbol: string) => {
    if (token) {
      setSyncing(true);
      try {
        const rows = await removeWatchSymbol(symbol);
        setSymbols(rows.map((r) => r.symbol.toUpperCase()));
      } catch {
        setSymbols((prev) => prev.filter((x) => x !== symbol));
      } finally {
        setSyncing(false);
      }
    } else {
      setSymbols((prev) => prev.filter((x) => x !== symbol));
    }
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={screenPad}>
      <SectionLabel
        subtitle={
          token
            ? 'Synced with your web account'
            : 'Sign in to sync with the website'
        }
      >
        Watchlist
      </SectionLabel>

      {!token && (
        <Text style={{ fontFamily: F.sans.regular, fontSize: 14, color: colors.textSecondary, marginBottom: space.sm }}>
          <Text style={s.signInLink} onPress={() => router.push('/login')}>
            Sign in
          </Text>{' '}
          to use the same list as the web app.
        </Text>
      )}

      {syncing && <ActivityIndicator color={colors.red} style={{ marginBottom: space.sm }} />}

      <View style={s.inputRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Add symbol"
          placeholderTextColor={colors.textDim}
          style={s.input}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={s.addBtn} onPress={addSymbol} disabled={syncing}>
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {symbols.length === 0 ? (
        <Text style={s.dim}>No symbols yet.</Text>
      ) : (
        <SurfaceCard padded={false}>
          {symbols.map((symbol, index) => {
            const q = quotes[symbol];
            const up = (q?.dp ?? 0) >= 0;
            return (
              <View key={symbol} style={{ paddingHorizontal: space.md }}>
                <View style={s.row}>
                  <View style={[s.symCircle, { backgroundColor: colors.red }]}>
                    <Text style={s.symText}>{symbol.slice(0, 2)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={s.sym}>{symbol}</Text>
                      <View style={{ flex: 1 }} />
                      <Text style={[s.price, { color: colors.textPrimary }]}>
                        {q?.c != null ? `$${q.c.toFixed(2)}` : '—'}
                      </Text>
                      <Text style={[s.change, { color: up ? colors.green : colors.red, marginLeft: 8 }]}>
                        {q?.dp != null ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : ''}
                      </Text>
                    </View>
                    <Text style={s.date}>
                      O {q ? q.o.toFixed(2) : '—'} · H {q ? q.h.toFixed(2) : '—'} · L {q ? q.l.toFixed(2) : '—'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeSymbol(symbol)} style={s.removeBtn}>
                    <Text style={s.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
                {index < symbols.length - 1 && <View style={s.divider} />}
              </View>
            );
          })}
        </SurfaceCard>
      )}
    </ScrollView>
  );
}
