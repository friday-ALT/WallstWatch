import type { Quote } from '../hooks/useLiveQuotes';

export type AlertType = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PCT_CHANGE';

export interface Alert {
  id: string;
  sym: string;
  type: AlertType;
  threshold: string;
  active: boolean;
  last_fired?: string | null;
}

export interface AlertEvent {
  id: string;
  alert_id: string;
  symbol: string;
  message: string;
  created_at: string;
  read?: number;
}

export const ALERT_TYPES: { id: AlertType; label: string; placeholder: string }[] = [
  { id: 'PRICE_ABOVE', label: 'Price above', placeholder: '580' },
  { id: 'PRICE_BELOW', label: 'Price below', placeholder: '520' },
  { id: 'PCT_CHANGE', label: 'Move ≥ %', placeholder: '2' },
];

export const QUICK_SYMBOLS = [
  'SPY', 'QQQ', 'DIA', 'IWM', 'VIX',
  'XLF', 'XLK', 'GLD',
  'AAPL', 'MSFT', 'NVDA',
  'JPM', 'GS', 'MS', 'BAC',
] as const;

export function parseThreshold(threshold: string): number {
  return parseFloat(threshold.replace(/[$%,\s]/g, '')) || 0;
}

export function evaluateAlert(alert: Alert, quote?: Quote): boolean {
  if (!alert.active || !quote?.c) return false;
  const thresh = parseThreshold(alert.threshold);
  switch (alert.type) {
    case 'PRICE_ABOVE':
      return quote.c >= thresh;
    case 'PRICE_BELOW':
      return quote.c <= thresh;
    case 'PCT_CHANGE':
      return Math.abs(quote.dp ?? 0) >= thresh;
    default:
      return false;
  }
}

export function ruleLabel(alert: Alert): string {
  const t = parseThreshold(alert.threshold);
  switch (alert.type) {
    case 'PRICE_ABOVE':
      return `Price above $${t.toFixed(2)}`;
    case 'PRICE_BELOW':
      return `Price below $${t.toFixed(2)}`;
    case 'PCT_CHANGE':
      return `Daily move ≥ ${t}%`;
    default:
      return alert.threshold;
  }
}

export function mapAlertRow(row: Record<string, unknown>): Alert {
  return {
    id: String(row.id),
    sym: String(row.symbol ?? row.sym ?? '').toUpperCase(),
    type: row.type as AlertType,
    threshold: String(row.threshold ?? ''),
    active: row.active === 1 || row.active === true,
    last_fired: (row.last_fired as string | null) ?? null,
  };
}

export const DEFAULT_LOCAL_ALERTS: Alert[] = [
  { id: 'local-1', sym: 'SPY', type: 'PCT_CHANGE', threshold: '2', active: true },
  { id: 'local-2', sym: 'SPY', type: 'PRICE_ABOVE', threshold: '580', active: true },
  { id: 'local-3', sym: 'QQQ', type: 'PCT_CHANGE', threshold: '2.5', active: true },
  { id: 'local-4', sym: 'VIX', type: 'PRICE_ABOVE', threshold: '22', active: true },
  { id: 'local-5', sym: 'JPM', type: 'PRICE_ABOVE', threshold: '280', active: true },
  { id: 'local-6', sym: 'GS', type: 'PRICE_BELOW', threshold: '520', active: true },
];
