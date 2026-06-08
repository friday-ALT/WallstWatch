import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authFetch } from '../constants/api';
import { getExpoPushToken, pushPlatform } from '../utils/pushNotifications';

const TOKEN_KEY = 'ww_token';
const PUSH_TOKEN_KEY = 'ww_push_token';

export type PlanTier = 'free' | 'pro' | 'professional' | 'institutional';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanTier;
  trialActive?: boolean;
  trialDaysLeft?: number;
  trial_ends?: string | null;
  created_at?: string;
  pushPriceAlerts?: boolean;
  pushNewsAlerts?: boolean;
}

export interface WatchlistRow {
  symbol: string;
  target?: string | null;
  conviction?: string;
  notes?: string;
  added_at?: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  fetchWatchlist: () => Promise<WatchlistRow[]>;
  addWatchSymbol: (symbol: string) => Promise<WatchlistRow[]>;
  removeWatchSymbol: (symbol: string) => Promise<WatchlistRow[]>;
  planLabel: string;
  syncPushToken: () => Promise<void>;
  updateNotificationPrefs: (prefs: { pushPriceAlerts?: boolean; pushNewsAlerts?: boolean }) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function planLabelFor(user: User | null): string {
  if (!user) return 'Guest';
  if (user.trialActive) return `Pro trial · ${user.trialDaysLeft ?? 0}d left`;
  return user.plan.charAt(0).toUpperCase() + user.plan.slice(1);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persistToken = useCallback(async (t: string | null) => {
    if (t) await AsyncStorage.setItem(TOKEN_KEY, t);
    else await AsyncStorage.removeItem(TOKEN_KEY);
    setToken(t);
  }, []);

  const syncPushToken = useCallback(async () => {
    if (!token) return;
    try {
      const pushToken = await getExpoPushToken();
      if (!pushToken) return;
      await authFetch('/push-token', {
        token,
        method: 'POST',
        body: { token: pushToken, platform: pushPlatform() },
      });
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, pushToken);
    } catch {
      /* permissions denied or simulator */
    }
  }, [token]);

  const unregisterPushToken = useCallback(async () => {
    const pushToken = await AsyncStorage.getItem(PUSH_TOKEN_KEY);
    if (pushToken && token) {
      try {
        await authFetch('/push-token', {
          token,
          method: 'DELETE',
          body: { token: pushToken },
        });
      } catch {
        /* ignore */
      }
    }
    await AsyncStorage.removeItem(PUSH_TOKEN_KEY);
  }, [token]);

  const updateNotificationPrefs = useCallback(
    async (prefs: { pushPriceAlerts?: boolean; pushNewsAlerts?: boolean }) => {
      if (!token) throw new Error('Sign in to manage notifications');
      const updated = await authFetch<{ pushPriceAlerts: boolean; pushNewsAlerts: boolean }>(
        '/notifications',
        { token, method: 'PATCH', body: prefs }
      );
      setUser((prev) =>
        prev
          ? { ...prev, pushPriceAlerts: updated.pushPriceAlerts, pushNewsAlerts: updated.pushNewsAlerts }
          : prev
      );
    },
    [token]
  );

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authFetch<User>('/me', { token });
      setUser(me);
    } catch {
      await persistToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token, persistToken]);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_KEY)
      .then((stored) => {
        if (stored) setToken(stored);
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (token) void refreshUser();
    else setUser(null);
  }, [token, refreshUser]);

  useEffect(() => {
    if (user && token) void syncPushToken();
  }, [user?.id, token, syncPushToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token: t, user: u } = await authFetch<{ token: string; user: User }>('/login', {
        method: 'POST',
        body: { email, password },
      });
      await persistToken(t);
      setUser(u);
      setLoading(false);
    },
    [persistToken]
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const { token: t, user: u } = await authFetch<{ token: string; user: User }>('/signup', {
        method: 'POST',
        body: { name, email, password },
      });
      await persistToken(t);
      setUser(u);
      setLoading(false);
    },
    [persistToken]
  );

  const logout = useCallback(async () => {
    await unregisterPushToken();
    await persistToken(null);
    setUser(null);
    setLoading(false);
  }, [persistToken, unregisterPushToken]);

  const fetchWatchlist = useCallback(async () => {
    if (!token) return [];
    return authFetch<WatchlistRow[]>('/watchlist', { token });
  }, [token]);

  const addWatchSymbol = useCallback(
    async (symbol: string) => {
      if (!token) throw new Error('Sign in to sync your watchlist');
      return authFetch<WatchlistRow[]>('/watchlist', {
        token,
        method: 'POST',
        body: { symbol: symbol.toUpperCase() },
      });
    },
    [token]
  );

  const removeWatchSymbol = useCallback(
    async (symbol: string) => {
      if (!token) throw new Error('Sign in to sync your watchlist');
      return authFetch<WatchlistRow[]>(`/watchlist/${encodeURIComponent(symbol.toUpperCase())}`, {
        token,
        method: 'DELETE',
      });
    },
    [token]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      signup,
      logout,
      refreshUser,
      fetchWatchlist,
      addWatchSymbol,
      removeWatchSymbol,
      planLabel: planLabelFor(user),
      syncPushToken,
      updateNotificationPrefs,
    }),
    [
      user,
      token,
      loading,
      login,
      signup,
      logout,
      refreshUser,
      fetchWatchlist,
      addWatchSymbol,
      removeWatchSymbol,
      syncPushToken,
      updateNotificationPrefs,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
