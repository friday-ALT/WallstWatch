import axios from 'axios';
import { QUOTE_UNIVERSE } from './quoteSymbols.js';

export interface Quote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

const FINNHUB_KEY = process.env.FINNHUB_API_KEY ?? '';
const CACHE_TTL_MS = 15_000;
const CHUNK_SIZE = 6;
const CHUNK_DELAY_MS = 120;

/** Yahoo Finance ticker overrides (Finnhub uses ETF tickers as-is) */
const YAHOO_SYMBOL: Record<string, string> = {
  VIX: '^VIX',
};

let cache: Record<string, Quote> = {};
let lastFullRefresh = 0;
let refreshInFlight: Promise<void> | null = null;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isValid(q: Quote | null | undefined): q is Quote {
  return !!q && typeof q.c === 'number' && q.c > 0;
}

async function fetchFinnhub(symbol: string): Promise<Quote | null> {
  if (!FINNHUB_KEY) return null;
  try {
    const { data } = await axios.get('https://finnhub.io/api/v1/quote', {
      params: { symbol, token: FINNHUB_KEY },
      timeout: 8000,
    });
    if (data?.error) return null;
    if (!data?.c || data.c <= 0) return null;
    return {
      c: data.c,
      d: data.d ?? 0,
      dp: data.dp ?? 0,
      h: data.h ?? data.c,
      l: data.l ?? data.c,
      o: data.o ?? data.c,
      pc: data.pc ?? data.c,
      t: data.t ?? Math.floor(Date.now() / 1000),
    };
  } catch {
    return null;
  }
}

async function fetchYahoo(symbol: string): Promise<Quote | null> {
  const yahooSym = YAHOO_SYMBOL[symbol] ?? symbol;
  try {
    const { data } = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}`,
      {
        params: { interval: '1d', range: '1d' },
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; WallstWatch/1.0)',
        },
      }
    );
    const result = data?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta?.regularMarketPrice) return null;

    const c = meta.regularMarketPrice as number;
    const pc = (meta.chartPreviousClose ?? meta.previousClose ?? c) as number;
    const d = c - pc;
    const dp = pc !== 0 ? (d / pc) * 100 : 0;

    return {
      c,
      d,
      dp,
      h: meta.regularMarketDayHigh ?? c,
      l: meta.regularMarketDayLow ?? c,
      o: meta.regularMarketOpen ?? c,
      pc,
      t: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
    };
  } catch {
    return null;
  }
}

async function fetchQuote(symbol: string): Promise<Quote | null> {
  const sym = symbol.toUpperCase();
  let q = await fetchFinnhub(sym);
  if (!isValid(q)) q = await fetchYahoo(sym);
  if (isValid(q)) cache[sym] = q;
  return q;
}

async function fetchQuotesChunked(symbols: string[]): Promise<Record<string, Quote>> {
  const out: Record<string, Quote> = {};
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))];

  for (let i = 0; i < unique.length; i += CHUNK_SIZE) {
    const chunk = unique.slice(i, i + CHUNK_SIZE);
    const settled = await Promise.allSettled(chunk.map((s) => fetchQuote(s)));
    settled.forEach((result, idx) => {
      const sym = chunk[idx];
      if (result.status === 'fulfilled' && isValid(result.value)) {
        out[sym] = result.value;
      } else if (cache[sym]) {
        out[sym] = cache[sym];
      }
    });
    if (i + CHUNK_SIZE < unique.length) await sleep(CHUNK_DELAY_MS);
  }

  return out;
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const sym = symbol.toUpperCase();
  const cached = cache[sym];
  if (cached && Date.now() - lastFullRefresh < CACHE_TTL_MS) return cached;
  return fetchQuote(sym);
}

export async function getQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const unique = [...new Set(symbols.map((s) => s.toUpperCase()))];
  const freshEnough = Date.now() - lastFullRefresh < CACHE_TTL_MS;

  const out: Record<string, Quote> = {};
  const missing: string[] = [];

  for (const sym of unique) {
    if (freshEnough && cache[sym]) out[sym] = cache[sym];
    else missing.push(sym);
  }

  if (missing.length === 0) return out;

  const fetched = await fetchQuotesChunked(missing);
  return { ...out, ...fetched };
}

export async function refreshQuoteCache(symbols: string[] = QUOTE_UNIVERSE): Promise<Record<string, Quote>> {
  if (refreshInFlight) {
    await refreshInFlight;
    return { ...cache };
  }

  refreshInFlight = (async () => {
    await fetchQuotesChunked(symbols);
    lastFullRefresh = Date.now();
  })();

  try {
    await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }

  return { ...cache };
}

export function getCachedQuotes(): Record<string, Quote> {
  return { ...cache };
}
