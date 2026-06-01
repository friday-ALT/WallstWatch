import { Quote } from '../../dashboard/hooks/useLiveQuotes';

const FALLBACK: { symbol: string; c: number; dp: number }[] = [
  { symbol: 'JPM', c: 283.15, dp: 1.11 },
  { symbol: 'GS', c: 562.4, dp: -0.86 },
  { symbol: 'MS', c: 118.23, dp: 1.24 },
  { symbol: 'BAC', c: 42.67, dp: 1.26 },
  { symbol: 'SPY', c: 634.1, dp: -0.44 },
  { symbol: 'QQQ', c: 507.7, dp: -0.85 },
  { symbol: 'VIX', c: 30.62, dp: -1.38 },
  { symbol: 'XLF', c: 48.2, dp: 0.92 },
];

interface Props {
  quotes: Record<string, Quote>;
}

export function MapTickerBar({ quotes }: Props) {
  const items = FALLBACK.map(fb => {
    const live = quotes[fb.symbol];
    return live ? { symbol: fb.symbol, c: live.c, dp: live.dp } : fb;
  });
  const doubled = [...items, ...items];

  return (
    <div className="mm-ticker-bar">
      <div className="mm-ticker-scroll">
        {doubled.map((item, i) => {
          const dir = item.dp > 0 ? 'up' : item.dp < 0 ? 'down' : 'up';
          const arrow = item.dp >= 0 ? '▲' : '▼';
          return (
            <div key={i} className="mm-ticker-item">
              <span className="mm-ticker-sym">{item.symbol}</span>
              <span className="mm-ticker-price">{item.c.toFixed(2)}</span>
              <span className={`mm-ticker-chg ${dir}`}>
                {arrow} {Math.abs(item.dp).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
