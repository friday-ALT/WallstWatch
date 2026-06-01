import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UNLOCK_ALL } from '../config/features';

export const DEMO_EMAIL = 'demo@wallstwatch.com';
export const DEMO_PASSWORD = 'demo1234';

export interface User {
  id: string; email: string; name: string;
  plan: 'free' | 'pro' | 'professional' | 'institutional';
  watchlist: string[];
  portfolio: { sym: string; shares: number; avgCost: number }[];
  alerts: { id: string; sym: string; type: string; threshold: string; active: boolean }[];
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  allFeaturesUnlocked: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ww_token'));
  const [loading, setLoading] = useState(true);

  const api = async (path: string, opts: RequestInit = {}) => {
    const res = await fetch(`/api/auth${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...opts.headers },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Request failed');
    return data;
  };

  const refreshUser = async () => {
    if (!token) { setLoading(false); return; }
    try { setUser(await api('/me')); } catch { logout(); }
    setLoading(false);
  };

  useEffect(() => { refreshUser(); }, [token]);

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await api('/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('ww_token', t);
    setToken(t); setUser(u);
  };

  const loginDemo = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('ww_token', data.token);
        setToken(data.token);
        setUser(data.user);
      }
    } catch {
      /* server offline */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!UNLOCK_ALL || token || loading) return;
    loginDemo();
  }, [UNLOCK_ALL, token, loading, loginDemo]);

  const signup = async (name: string, email: string, password: string) => {
    const { token: t, user: u } = await api('/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    localStorage.setItem('ww_token', t);
    setToken(t); setUser(u);
  };

  const logout = () => { localStorage.removeItem('ww_token'); setToken(null); setUser(null); setLoading(false); };

  return (
    <Ctx.Provider value={{
      user, token, loading,
      allFeaturesUnlocked: UNLOCK_ALL,
      login, signup, logout, refreshUser,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
