import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface TerminalCtx {
  symbol: string;
  setSymbol: (s: string) => void;
  goEquity: (s: string) => void;
  goDashboard: (tab?: string) => void;
  goMap: () => void;
}

const Ctx = createContext<TerminalCtx | null>(null);

export function TerminalProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [symbol, setSymbolState] = useState(() => localStorage.getItem('ww_symbol') ?? 'JPM');

  const setSymbol = useCallback((s: string) => {
    const sym = s.toUpperCase();
    setSymbolState(sym);
    localStorage.setItem('ww_symbol', sym);
  }, []);

  useEffect(() => {
    const m = location.pathname.match(/^\/equity\/([A-Za-z.]+)/);
    if (m) setSymbolState(m[1].toUpperCase());
  }, [location.pathname]);

  const goEquity = useCallback((s: string) => {
    setSymbol(s);
    navigate(`/equity/${s.toUpperCase()}`);
  }, [navigate, setSymbol]);

  const goDashboard = useCallback((tab?: string) => {
    navigate(tab ? `/dashboard?tab=${tab}` : '/dashboard');
  }, [navigate]);

  const goMap = useCallback(() => navigate('/map'), [navigate]);

  return (
    <Ctx.Provider value={{ symbol, setSymbol, goEquity, goDashboard, goMap }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTerminal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useTerminal requires TerminalProvider');
  return ctx;
}
