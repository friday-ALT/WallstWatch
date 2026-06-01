import { useEffect, useState } from 'react';
import { platform } from '../../lib/api';
import { useTerminal } from '../../terminal/TerminalProvider';

export function NewsIntelView() {
  const { symbol } = useTerminal();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = () => {
    setLoading(true);
    platform.newsTagged(q || undefined, symbol).then(setItems).catch(() => setItems([])).finally(() => setLoading(false));
  };

  useEffect(() => { search(); }, [symbol]);

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">NEWS INTELLIGENCE — {symbol}</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search headlines…"
          style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}
          onKeyDown={e => e.key === 'Enter' && search()}
        />
        <button type="button" className="dc-sym-chip active" onClick={search}>SEARCH</button>
      </div>
      {loading && <div className="dc-loading">Loading…</div>}
      {items.map((n, i) => (
        <a key={i} href={n.url} target="_blank" rel="noreferrer" className="dc-news-card">
          <div className="dc-news-card-tags">
            {(n.tags ?? []).map((t: string) => <span key={t} className="dc-tag">{t}</span>)}
            <span className={`dc-tag sentiment-${(n.sentiment ?? 'neutral').toLowerCase()}`}>{n.sentiment}</span>
          </div>
          <div className="dc-news-headline">{n.headline}</div>
          <div className="dc-news-meta">{n.source} · {new Date(n.datetime * 1000).toLocaleDateString()}</div>
        </a>
      ))}
    </div>
  );
}
