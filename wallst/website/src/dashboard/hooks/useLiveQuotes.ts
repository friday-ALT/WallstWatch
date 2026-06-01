import { useEffect, useRef, useState } from 'react';

export interface Quote { symbol: string; c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; }

export function useLiveQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const key = symbols.join(',');

  // Fetch initial batch — server now returns Record<symbol, quote>
  useEffect(() => {
    fetch(`/api/quotes?symbols=${encodeURIComponent(key)}`)
      .then(r => r.json())
      .then((data: Record<string, Quote>) => {
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setQuotes(data);
        }
      })
      .catch(() => {});
  }, [key]);

  // WebSocket live updates — server sends { type: 'prices', data: Record<sym, quote> }
  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    wsRef.current = ws;
    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'prices' && msg.data && typeof msg.data === 'object') {
          setQuotes(prev => ({ ...prev, ...msg.data }));
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  return quotes;
}
