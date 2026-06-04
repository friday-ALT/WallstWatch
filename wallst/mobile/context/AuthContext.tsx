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

const TOKEN_KEY = 'ww_token';

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
    await persistToken(null);
    setUser(null);
    setLoading(false);
  }, [persistToken]);

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
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
