import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { apiFetch, API_BASE } from '../constants/api';

export interface Quote {
  c: number; d: number; dp: number;
  h: number; l: number; o: number; pc: number; t: number;
}

function wsUrl(): string {
  if (Platform.OS === 'web') {
    const proto = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:8081';
    return `${proto}://${host}/ws`;
  }
  const host = API_BASE.replace(/\/api\/?$/, '');
  if (host.startsWith('https://')) return host.replace('https://', 'wss://') + '/ws';
  return host.replace('http://', 'ws://') + '/ws';
}

function normalizeQuotes(raw: Record<string, unknown>): Record<string, Quote> {
  const out: Record<string, Quote> = {};
  for (const [sym, val] of Object.entries(raw)) {
    if (!val || typeof val !== 'object') continue;
    const q = val as Record<string, unknown>;
    if (typeof q.c !== 'number' || q.c <= 0) continue;
    out[sym] = {
      c: q.c,
      d: (q.d as number) ?? 0,
      dp: (q.dp as number) ?? 0,
      h: (q.h as number) ?? q.c,
      l: (q.l as number) ?? q.c,
      o: (q.o as number) ?? q.c,
      pc: (q.pc as number) ?? q.c,
      t: (q.t as number) ?? 0,
    };
  }
  return out;
}

const QUOTE_CHUNK = 24;

async function fetchQuoteChunks(symbols: string[]): Promise<Record<string, Quote>> {
  const merged: Record<string, Quote> = {};
  for (let i = 0; i < symbols.length; i += QUOTE_CHUNK) {
    const chunk = symbols.slice(i, i + QUOTE_CHUNK);
    try {
      const data = await apiFetch<Record<string, unknown>>(
        `/quotes?symbols=${encodeURIComponent(chunk.join(','))}`
      );
      if ('error' in data) continue;
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
    const symbols = key.split(',').filter(Boolean);
    fetchQuoteChunks(symbols)
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

  useEffect(() => {
    const ws = new WebSocket(wsUrl());
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data?.type === 'prices' && data?.data) {
          setQuotes((prev) => ({ ...prev, ...normalizeQuotes(data.data) }));
        }
      } catch {}
    };

    return () => { ws.close(); };
  }, []);

  return quotes;
}
