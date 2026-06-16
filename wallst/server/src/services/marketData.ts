import { getQuotes } from './quotes.js';

const SECTOR_ETFS = ['XLF', 'XLK', 'XLE', 'XLV', 'XLI', 'XLY', 'XLP', 'XLU', 'XLRE', 'XLB', 'XLC'];

const YIELD_TENORS = [
  { label: '3M', symbol: 'US3MY' },
  { label: '6M', symbol: 'US06MY' },
  { label: '1Y', symbol: 'US1Y' },
  { label: '2Y', symbol: 'US2Y' },
  { label: '5Y', symbol: 'US5Y' },
  { label: '10Y', symbol: 'US10Y' },
  { label: '20Y', symbol: 'US20Y' },
  { label: '30Y', symbol: 'US30Y' },
];

const FX_PAIRS: { pair: string; symbol: string }[] = [
  { pair: 'EUR/USD', symbol: 'EURUSD' },
  { pair: 'GBP/USD', symbol: 'GBPUSD' },
  { pair: 'USD/JPY', symbol: 'USDJPY' },
  { pair: 'USD/CHF', symbol: 'USDCHF' },
  { pair: 'AUD/USD', symbol: 'AUDUSD' },
  { pair: 'USD/CAD', symbol: 'USDCAD' },
  { pair: 'NZD/USD', symbol: 'NZDUSD' },
  { pair: 'USD/CNH', symbol: 'USDCNH' },
];

const FIXED_INCOME = [
  { label: '2Y', sym: 'US2Y' },
  { label: '5Y', sym: 'US5Y' },
  { label: '10Y', sym: 'US10Y' },
  { label: '30Y', sym: 'US30Y' },
  { label: 'HYG', sym: 'HYG' },
  { label: 'LQD', sym: 'LQD' },
  { label: 'TLT', sym: 'TLT' },
  { label: 'TIP', sym: 'TIP' },
];

const COMMODITIES = [
  { name: 'Gold (XAU)', symbol: 'GC' },
  { name: 'WTI Crude', symbol: 'CL' },
];

export async function getSectorQuotes() {
  const quotes = await getQuotes(SECTOR_ETFS);
  return SECTOR_ETFS.map((symbol) => {
    const q = quotes[symbol];
    return {
      symbol,
      c: q?.c ?? null,
      d: q?.d ?? null,
      dp: q?.dp ?? null,
      h: q?.h ?? null,
      l: q?.l ?? null,
      pc: q?.pc ?? null,
      t: q?.t ?? null,
    };
  });
}

export async function getYieldCurve() {
  const symbols = YIELD_TENORS.map((t) => t.symbol);
  const quotes = await getQuotes(symbols);
  return YIELD_TENORS.map((t) => {
    const q = quotes[t.symbol];
    return {
      ...t,
      yield: q?.c ?? null,
      prevYield: q?.pc ?? null,
      change: q?.d ?? null,
      updatedAt: q?.t ? new Date(q.t * 1000).toISOString() : null,
    };
  });
}

export async function getFxMatrix() {
  const symbols = FX_PAIRS.map((f) => f.symbol);
  const quotes = await getQuotes(symbols);
  return FX_PAIRS.map(({ pair, symbol }) => {
    const q = quotes[symbol];
    return {
      pair,
      symbol,
      price: q?.c ?? null,
      change: q?.dp ?? null,
      high: q?.h ?? null,
      low: q?.l ?? null,
      updatedAt: q?.t ? new Date(q.t * 1000).toISOString() : null,
    };
  });
}

export async function getFixedIncomeBoard() {
  const symbols = FIXED_INCOME.map((r) => r.sym);
  const quotes = await getQuotes(symbols);
  return FIXED_INCOME.map((row) => {
    const q = quotes[row.sym];
    const isYield = row.sym.startsWith('US');
    return {
      ...row,
      price: q?.c ?? null,
      change: isYield ? (q?.d ?? null) : (q?.dp ?? null),
      unit: isYield ? 'yield' : 'price',
      updatedAt: q?.t ? new Date(q.t * 1000).toISOString() : null,
    };
  });
}

export async function getCommodityQuotes() {
  const symbols = COMMODITIES.map((c) => c.symbol);
  const quotes = await getQuotes(symbols);
  return COMMODITIES.map((c) => {
    const q = quotes[c.symbol];
    return {
      ...c,
      price: q?.c ?? null,
      change: q?.dp ?? null,
      updatedAt: q?.t ? new Date(q.t * 1000).toISOString() : null,
    };
  });
}

export async function getMarketBreadth() {
  const sectors = await getSectorQuotes();
  const valid = sectors.filter((s) => s.dp != null);
  const advances = valid.filter((s) => (s.dp ?? 0) > 0).length;
  const declines = valid.filter((s) => (s.dp ?? 0) < 0).length;
  const unchanged = valid.length - advances - declines;
  return {
    source: 'Sector ETF proxies (Finnhub/Yahoo)',
    delayNote: 'Delayed · 15 min',
    updatedAt: new Date().toISOString(),
    advDecLine: { advances, declines, unchanged },
    sectors: valid.map((s) => ({
      symbol: s.symbol,
      chg: s.dp ?? 0,
      adv: (s.dp ?? 0) > 0 ? 1 : 0,
      dec: (s.dp ?? 0) < 0 ? 1 : 0,
    })),
  };
}

export async function getMacroRates() {
  const symbols = ['US10Y', 'US2Y', 'VIX', 'DXY', 'GC', 'CL'];
  const quotes = await getQuotes(symbols);
  const y10 = quotes.US10Y?.c;
  const y2 = quotes.US2Y?.c;
  const spread = y10 != null && y2 != null ? y10 - y2 : null;
  return {
    updatedAt: new Date().toISOString(),
    delayNote: 'Live · 15s cache',
    rates: [
      { label: '10Y YIELD', value: y10, format: 'pct' },
      { label: '2Y YIELD', value: y2, format: 'pct' },
      { label: '2s10s SPREAD', value: spread, format: 'bps' },
      { label: 'VIX', value: quotes.VIX?.c, format: 'num' },
      { label: 'DXY', value: quotes.DXY?.c, format: 'num' },
      { label: 'WTI CRUDE', value: quotes.CL?.c, format: 'usd' },
      { label: 'GOLD', value: quotes.GC?.c, format: 'usd' },
    ],
  };
}
