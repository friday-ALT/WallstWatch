import { useEffect, useRef, useState } from 'react';
import { apiFetch, API_BASE } from '../constants/api';

export interface Quote {
  c: number; d: number; dp: number;
  h: number; l: number; o: number; pc: number; t: number;
}

export function useLiveQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const key = symbols.join(',');

  useEffect(() => {
    apiFetch<Record<string, Quote>>(`/quotes?symbols=${encodeURIComponent(key)}`)
      .then(setQuotes)
      .catch(() => {});
  }, [key]);

  useEffect(() => {
    const wsUrl = API_BASE.replace('http://', 'ws://').replace('/api', '/ws');
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setQuotes((prev) => ({ ...prev, ...data }));
      } catch {}
    };

    return () => { ws.close(); };
  }, []);

  return quotes;
}
