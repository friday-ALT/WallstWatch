import { useEffect, useRef, useState, useCallback } from 'react';

export interface Quote { symbol: string; c: number; d: number; dp: number; h: number; l: number; o: number; pc: number; }

const QUOTE_CHUNK = 24;

function normalizeQuotes(raw: Record<string, unknown>): Record<string, Quote> {
  const out: Record<string, Quote> = {};
  for (const [sym, val] of Object.entries(raw)) {
    if (!val || typeof val !== 'object') continue;
    const q = val as Record<string, unknown>;
    if (typeof q.c !== 'number' || q.c <= 0) continue;
    out[sym] = {
      symbol: sym,
      c: q.c,
      d: (q.d as number) ?? 0,
      dp: (q.dp as number) ?? 0,
      h: (q.h as number) ?? q.c,
      l: (q.l as number) ?? q.c,
      o: (q.o as number) ?? q.c,
      pc: (q.pc as number) ?? q.c,
    };
  }
  return out;
}

async function fetchQuoteChunks(symbols: string[]): Promise<Record<string, Quote>> {
  const merged: Record<string, Quote> = {};
  for (let i = 0; i < symbols.length; i += QUOTE_CHUNK) {
    const chunk = symbols.slice(i, i + QUOTE_CHUNK);
    try {
      const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(chunk.join(','))}`);
      if (!res.ok) continue;
      const data = (await res.json()) as Record<string, unknown>;
      if (data?.error) continue;
      Object.assign(merged, normalizeQuotes(data));
    } catch {
      /* partial results still useful */
    }
  }
  return merged;
}

export function useLiveQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const key = symbols.join(',');

  const fetchQuotes = useCallback(() => {
    if (!key) return;
    const list = key.split(',').filter(Boolean);
    fetchQuoteChunks(list)
      .then((data) => {
        if (Object.keys(data).length > 0) {
          setQuotes((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, [key]);

  useEffect(() => {
    fetchQuotes();
    const id = setInterval(fetchQuotes, 20_000);
    return () => clearInterval(id);
  }, [fetchQuotes]);

  // WebSocket live updates — server sends { type: 'prices', data: Record<sym, quote> }
  useEffect(() => {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    wsRef.current = ws;
    ws.onmessage = e => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'prices' && msg.data && typeof msg.data === 'object') {
          setQuotes(prev => ({ ...prev, ...normalizeQuotes(msg.data) }));
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  return quotes;
}
