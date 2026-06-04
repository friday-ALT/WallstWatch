import { useEffect, useState } from 'react';
import { Quote } from '../hooks/useLiveQuotes';
import { ThemeBucketCard } from '../components/ThemeBucketCard';
import { MARKET_THEMES } from '../data/marketThemes';

const INDICATORS = [
  { l: 'Fed Funds Rate', v: '4.50%', n: 'Target 4.25–4.50%', c: '#ffc107' },
  { l: 'US 10Y Yield', v: '4.38%', n: '↑ from 3.9% Jan', c: '#ffc107' },
  { l: 'US 2Y Yield', v: '4.72%', n: 'Inverted -34bps', c: '#ff3b3b' },
  { l: 'Spread 2s10s', v: '-34bps', n: 'Recessionary signal', c: '#ff3b3b' },
  { l: 'CPI (Mar)', v: '3.2%', n: 'Above 2% target', c: '#ffc107' },
  { l: 'PCE (Feb)', v: '2.8%', n: 'Fed preferred', c: '#ffc107' },
  { l: 'GDP Q4 2025', v: '+2.4%', n: 'Annualized SAAR', c: '#00e676' },
  { l: 'Unemployment', v: '3.9%', n: 'Near full employment', c: '#00e676' },
  { l: 'DXY', v: '104.2', n: 'Dollar strengthening', c: '#2196f3' },
  { l: 'Gold (XAU)', v: '$2,312', n: 'Safe haven bid', c: '#ffc107' },
  { l: 'WTI Crude', v: '$79.2', n: '↑ Iran tensions', c: '#ff3b3b' },
  { l: 'VIX', v: '18.4', n: 'Elevated vs 2024', c: '#ffc107' },
];

interface Props {
  quotes: Record<string, Quote>;
}

export function MacroView({ quotes }: Props) {
  const [news, setNews] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((d) => setNews(d.slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label" style={{ marginBottom: 12 }}>
        MARKET DASHBOARD — THEMATIC WATCHLISTS
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 12,
          marginBottom: 28,
        }}
      >
        {MARKET_THEMES.map((theme) => (
          <ThemeBucketCard key={theme.id} theme={theme} quotes={quotes} />
        ))}
      </div>

      <div className="dc-two-col">
        <div>
          <div className="dc-section-label">MACRO INDICATORS</div>
          <div className="dc-table">
            {INDICATORS.map((ind, i) => (
              <div key={i} className="dc-table-row">
                <span className="dc-table-label">{ind.l}</span>
                <span className="dc-table-val" style={{ color: ind.c }}>
                  {ind.v}
                </span>
                <span className="dc-table-note">{ind.n}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="dc-section-label">INDEX PULSE</div>
          {(['SPY', 'QQQ', 'DIA', 'IWM', 'VIX'] as const).map((sym) => {
            const q = quotes[sym];
            const up = q ? q.dp >= 0 : true;
            return (
              <div key={sym} className="dc-quote-row">
                <span className="dc-quote-sym">{sym}</span>
                <span className="dc-quote-price" style={{ color: up ? '#00e676' : '#ff3b3b' }}>
                  {q ? (sym === 'VIX' ? q.c.toFixed(2) : `$${q.c.toFixed(2)}`) : '—'}
                </span>
                <span className="dc-quote-chg" style={{ color: up ? '#00e676' : '#ff3b3b' }}>
                  {q ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : ''}
                </span>
              </div>
            );
          })}
          <div className="dc-section-label" style={{ marginTop: 20 }}>
            MARKET NEWS
          </div>
          {news.map((item, i) => (
            <a key={i} href={item.url || '#'} target="_blank" rel="noreferrer" className="dc-news-item">
              <span className="dc-news-headline">{item.headline}</span>
              <span className="dc-news-meta">{item.source}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
