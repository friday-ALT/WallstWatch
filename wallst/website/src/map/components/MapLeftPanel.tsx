import { useEffect, useState } from 'react';

interface NewsItem {
  datetime: number;
  headline: string;
  source: string;
  url?: string;
}

const COMMODITIES = [
  { n: 'WTI Crude', p: '$79.20', c: '+1.2%', d: 'up' as const },
  { n: 'Brent', p: '$83.10', c: '+1.1%', d: 'up' as const },
  { n: 'Nat Gas', p: '$3.42', c: '-0.8%', d: 'down' as const },
  { n: 'Gold', p: '$2,544', c: '+0.4%', d: 'up' as const },
  { n: 'Silver', p: '$30.12', c: '+0.9%', d: 'up' as const },
];
const RATES = [
  { n: 'Fed Funds', p: '4.50%', c: 'HOLD', d: '' as const },
  { n: 'US 2Y', p: '4.72%', c: '-4bp', d: 'down' as const },
  { n: 'US 10Y', p: '4.38%', c: '-6bp', d: 'down' as const },
  { n: 'VIX', p: '18.4', c: '-2.1%', d: 'down' as const },
];

function timeAgo(ts: number) {
  const diff = Math.floor(Date.now() / 1000 - ts) / 60;
  if (diff < 1) return 'just now';
  if (diff < 60) return `${Math.floor(diff)}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function MapLeftPanel() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => Array.isArray(d) && setNews(d.slice(0, 8)))
      .catch(() => {});
  }, []);

  const fallback: NewsItem[] = [
    { datetime: Date.now() / 1000 - 300, headline: 'Financials lead S&P as big banks rally into earnings week', source: 'Reuters' },
    { datetime: Date.now() / 1000 - 1800, headline: 'Fed officials signal patience on cuts amid sticky services inflation', source: 'Bloomberg' },
    { datetime: Date.now() / 1000 - 3600, headline: 'European banks under pressure as French spreads widen', source: 'FT' },
  ];
  const items = news.length > 0 ? news : fallback;

  return (
    <aside className="mm-left">
      <div className="mm-panel-section">
        <div className="mm-panel-header" style={{ color: 'var(--red)' }}>
          <span className="mm-panel-dot" style={{ background: 'var(--red)' }} />
          LATEST INTEL
        </div>
        {items.map((n, i) => (
          <div
            key={i}
            className="mm-news-item"
            onClick={() => n.url && window.open(n.url, '_blank')}
          >
            <div className="mm-news-time">{timeAgo(n.datetime)}</div>
            <div className="mm-news-headline">{n.headline}</div>
            {n.source && <div className="mm-news-source">{n.source}</div>}
          </div>
        ))}
      </div>

      <div className="mm-panel-section">
        <div className="mm-panel-header" style={{ color: 'var(--amber)' }}>
          <span className="mm-panel-dot" style={{ background: 'var(--amber)' }} />
          COMMODITIES
        </div>
        {COMMODITIES.map(c => (
          <div key={c.n} className="mm-data-row">
            <span className="mm-data-name">{c.n}</span>
            <span className="mm-data-price">{c.p}</span>
            <span className={`mm-data-chg ${c.d || 'up'}`}>{c.c}</span>
          </div>
        ))}
      </div>

      <div className="mm-panel-section">
        <div className="mm-panel-header" style={{ color: 'var(--cyan)' }}>
          <span className="mm-panel-dot" style={{ background: 'var(--cyan)' }} />
          KEY RATES
        </div>
        {RATES.map(r => (
          <div key={r.n} className="mm-data-row">
            <span className="mm-data-name">{r.n}</span>
            <span className="mm-data-price">{r.p}</span>
            <span className={`mm-data-chg ${r.d || 'up'}`}>{r.c}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}
