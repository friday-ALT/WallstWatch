/** Shared market universe for watchlist, alerts, and dashboard quotes */

import { ALL_THEME_SYMBOLS } from './marketThemes';

export type SymbolCategory = 'Index' | 'Sector' | 'Mega cap' | 'Bank';

export interface MarketSymbol {
  sym: string;
  name: string;
  category: SymbolCategory;
}

export const MARKET_SYMBOLS: MarketSymbol[] = [
  // Major indexes & macro
  { sym: 'SPY', name: 'S&P 500', category: 'Index' },
  { sym: 'QQQ', name: 'Nasdaq 100', category: 'Index' },
  { sym: 'DIA', name: 'Dow 30', category: 'Index' },
  { sym: 'IWM', name: 'Russell 2000', category: 'Index' },
  { sym: 'VIX', name: 'VIX', category: 'Index' },
  // Sector & macro ETFs
  { sym: 'XLF', name: 'Financials', category: 'Sector' },
  { sym: 'XLK', name: 'Technology', category: 'Sector' },
  { sym: 'XLE', name: 'Energy', category: 'Sector' },
  { sym: 'XLV', name: 'Health care', category: 'Sector' },
  { sym: 'GLD', name: 'Gold', category: 'Sector' },
  { sym: 'TLT', name: '20Y Treasury', category: 'Sector' },
  // Mega caps
  { sym: 'AAPL', name: 'Apple', category: 'Mega cap' },
  { sym: 'MSFT', name: 'Microsoft', category: 'Mega cap' },
  { sym: 'NVDA', name: 'NVIDIA', category: 'Mega cap' },
  { sym: 'AMZN', name: 'Amazon', category: 'Mega cap' },
  { sym: 'GOOGL', name: 'Alphabet', category: 'Mega cap' },
  { sym: 'META', name: 'Meta', category: 'Mega cap' },
  { sym: 'TSLA', name: 'Tesla', category: 'Mega cap' },
  // Banks
  { sym: 'JPM', name: 'JPMorgan', category: 'Bank' },
  { sym: 'GS', name: 'Goldman Sachs', category: 'Bank' },
  { sym: 'MS', name: 'Morgan Stanley', category: 'Bank' },
  { sym: 'BAC', name: 'Bank of America', category: 'Bank' },
  { sym: 'C', name: 'Citigroup', category: 'Bank' },
  { sym: 'WFC', name: 'Wells Fargo', category: 'Bank' },
  { sym: 'USB', name: 'US Bancorp', category: 'Bank' },
  { sym: 'DB', name: 'Deutsche Bank', category: 'Bank' },
];

export const ALL_SYMBOLS = MARKET_SYMBOLS.map((s) => s.sym);

/** Symbols streamed on the dashboard ticker + live quote bar */
export const DASHBOARD_TICKER_SYMS = [
  ...new Set([
    'SPY', 'QQQ', 'DIA', 'IWM', 'VIX',
    'XLF', 'XLK', 'GLD',
    'AAPL', 'MSFT', 'NVDA',
    'JPM', 'GS', 'MS', 'BAC', 'C', 'WFC',
    ...ALL_THEME_SYMBOLS,
  ]),
];

export const SYMBOLS_BY_CATEGORY = MARKET_SYMBOLS.reduce(
  (acc, s) => {
    (acc[s.category] ??= []).push(s);
    return acc;
  },
  {} as Record<SymbolCategory, MarketSymbol[]>
);

export type WatchlistItem = {
  sym: string;
  target: number;
  conviction: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  notes: string;
  addedAt: string;
};

export const DEFAULT_WATCHLIST: WatchlistItem[] = [
  { sym: 'SPY', target: 560, conviction: 'BUY', notes: 'Broad market — risk-on baseline', addedAt: '2026-04-01' },
  { sym: 'QQQ', target: 500, conviction: 'BUY', notes: 'Mega-cap tech leadership', addedAt: '2026-04-01' },
  { sym: 'VIX', target: 22, conviction: 'NEUTRAL', notes: 'Volatility hedge — watch spikes above 22', addedAt: '2026-04-02' },
  { sym: 'JPM', target: 310, conviction: 'BUY', notes: 'Fortress capital, buyback, FOMC tailwind', addedAt: '2026-04-03' },
  { sym: 'GS', target: 590, conviction: 'NEUTRAL', notes: 'FICC & advisory — earnings sensitivity', addedAt: '2026-04-04' },
  { sym: 'NVDA', target: 1100, conviction: 'STRONG BUY', notes: 'AI capex supercycle, data centre demand', addedAt: '2026-04-05' },
  { sym: 'XLF', target: 48, conviction: 'NEUTRAL', notes: 'Financial sector ETF — rate path proxy', addedAt: '2026-04-06' },
];

export type DefaultAlert = {
  id: string;
  sym: string;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PCT_CHANGE' | 'INSIDER_BUY' | 'EARNINGS';
  threshold: string;
  active: boolean;
};

export const DEFAULT_ALERTS: DefaultAlert[] = [
  { id: '1', sym: 'SPY', type: 'PCT_CHANGE', threshold: '2', active: true },
  { id: '2', sym: 'SPY', type: 'PRICE_ABOVE', threshold: '580', active: true },
  { id: '3', sym: 'QQQ', type: 'PCT_CHANGE', threshold: '2.5', active: true },
  { id: '4', sym: 'VIX', type: 'PRICE_ABOVE', threshold: '22', active: true },
  { id: '5', sym: 'JPM', type: 'PRICE_ABOVE', threshold: '280', active: true },
  { id: '6', sym: 'GS', type: 'PRICE_BELOW', threshold: '520', active: true },
  { id: '7', sym: 'IWM', type: 'PCT_CHANGE', threshold: '2', active: false },
];

/** Default watchlist rows seeded on new account signup */
export const SIGNUP_WATCHLIST = ['SPY', 'QQQ', 'JPM', 'GS', 'NVDA', 'XLF'];
