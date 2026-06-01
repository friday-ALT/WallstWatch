import { useEffect, useState } from 'react';

const ALL_SYMBOLS = [
  // Banking
  { sym:'JPM',  name:'JPMorgan Chase',  sector:'Banking' },
  { sym:'GS',   name:'Goldman Sachs',   sector:'Banking' },
  { sym:'MS',   name:'Morgan Stanley',  sector:'Banking' },
  { sym:'BAC',  name:'Bank of America', sector:'Banking' },
  { sym:'C',    name:'Citigroup',       sector:'Banking' },
  { sym:'WFC',  name:'Wells Fargo',     sector:'Banking' },
  { sym:'SCHW', name:'Charles Schwab',  sector:'Banking' },
  // Tech
  { sym:'AAPL', name:'Apple',           sector:'Technology' },
  { sym:'MSFT', name:'Microsoft',       sector:'Technology' },
  { sym:'GOOGL',name:'Alphabet',        sector:'Technology' },
  { sym:'NVDA', name:'NVIDIA',          sector:'Technology' },
  { sym:'META', name:'Meta Platforms',  sector:'Technology' },
  { sym:'AMZN', name:'Amazon',          sector:'Technology' },
  // Energy
  { sym:'XOM',  name:'Exxon Mobil',     sector:'Energy' },
  { sym:'CVX',  name:'Chevron',         sector:'Energy' },
  { sym:'COP',  name:'ConocoPhillips',  sector:'Energy' },
  // Healthcare
  { sym:'JNJ',  name:'Johnson & Johnson',sector:'Healthcare' },
  { sym:'PFE',  name:'Pfizer',          sector:'Healthcare' },
  { sym:'UNH',  name:'UnitedHealth',    sector:'Healthcare' },
  { sym:'ABBV', name:'AbbVie',          sector:'Healthcare' },
];

type SortKey = 'sym' | 'price' | 'change' | 'pe' | 'marketCap';

export function ScreenerView({ token }: { token?: string | null }) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState('All');
  const [sort, setSort] = useState<SortKey>('marketCap');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => {
    const syms = ALL_SYMBOLS.map(s => s.sym).join(',');
    fetch(`/api/screener?symbols=${syms}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const setSort2 = (key: SortKey) => {
    if (sort === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSort(key); setSortDir('desc'); }
  };

  const enriched = ALL_SYMBOLS.map(s => {
    const row = data.find((d: any) => d.symbol === s.sym);
    const q = row?.quote; const m = row?.metrics ?? {};
    return { ...s, price: q?.c ?? null, change: q?.dp ?? null, pe: m['peBasicExclExtraTTM'] ?? null, marketCap: m['marketCapitalization'] ?? null, week52High: m['52WeekHigh'] ?? null, week52Low: m['52WeekLow'] ?? null };
  });

  const filtered = enriched.filter(s => sector === 'All' || s.sector === sector);
  const sorted = [...filtered].sort((a, b) => {
    const va = (a as any)[sort] ?? -Infinity;
    const vb = (b as any)[sort] ?? -Infinity;
    return sortDir === 'desc' ? vb - va : va - vb;
  });

  const sectors = ['All', 'Banking', 'Technology', 'Energy', 'Healthcare'];
  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => setSort2(k)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: sort === k ? 'var(--red)' : 'var(--text-dim)', letterSpacing: 1, padding: '4px 0', display: 'flex', alignItems: 'center', gap: 3 }}>
      {label} {sort === k ? (sortDir === 'desc' ? '▼' : '▲') : ''}
    </button>
  );

  return (
    <div className="dc-scroll-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div className="dc-section-label" style={{ margin: 0 }}>STOCK SCREENER</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {token && (
            <button type="button" className="dc-sym-chip" onClick={async () => {
              await fetch('/api/platform/screens', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: `${sector} screen`, filters: { sector, sort }, symbols: sorted.map(s => s.sym) }),
              });
              alert('Screen saved.');
            }}>SAVE SCREEN</button>
          )}
          <button type="button" className="dc-sym-chip active" onClick={() => {
            const csv = ['symbol,name,sector,price,change,pe,marketCap', ...sorted.map(s =>
              `${s.sym},${s.name},${s.sector},${s.price ?? ''},${s.change ?? ''},${s.pe ?? ''},${s.marketCap ?? ''}`
            )].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'screener.csv';
            a.click();
          }}>↓ CSV</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="dc-sym-bar" style={{ padding: 0, background: 'none', border: 'none', flexWrap: 'wrap', gap: 4 }}>
          {sectors.map(s => (
            <button key={s} className={`dc-sym-chip${sector === s ? ' active' : ''}`} onClick={() => setSector(s)}>{s}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{sorted.length} stocks</div>
      </div>

      {loading && <div className="dc-loading">Loading screener data…</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)' }}>
              {[
                { k: 'sym' as SortKey, l: 'SYMBOL' },
                { k: 'price' as SortKey, l: 'PRICE' },
                { k: 'change' as SortKey, l: '% TODAY' },
                { k: 'pe' as SortKey, l: 'P/E' },
                { k: 'marketCap' as SortKey, l: 'MKT CAP' },
              ].map(col => (
                <th key={col.k} style={{ padding: '10px 12px', textAlign: col.k === 'sym' ? 'left' : 'right' }}>
                  <SortBtn k={col.k} label={col.l} />
                </th>
              ))}
              <th style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1, textAlign: 'right' }}>52W RANGE</th>
              <th style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1 }}>SECTOR</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => {
              const up = (s.change ?? 0) >= 0;
              const mc = s.marketCap ? s.marketCap >= 1000 ? `$${(s.marketCap/1000).toFixed(0)}B` : `$${s.marketCap.toFixed(0)}M` : '—';
              const pct52 = s.week52High && s.week52Low && s.price ? ((s.price - s.week52Low) / (s.week52High - s.week52Low)) * 100 : null;
              return (
                <tr key={s.sym} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : '#ffffff03' }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.sym}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{s.name}</div>
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: up ? '#00e676' : '#ff3b3b' }}>
                    {s.price ? `$${s.price.toFixed(2)}` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: up ? '#00e676' : '#ff3b3b' }}>
                    {s.change != null ? `${up ? '+' : ''}${s.change.toFixed(2)}%` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-sec)' }}>
                    {s.pe != null ? s.pe.toFixed(1) + 'x' : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-sec)' }}>{mc}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    {pct52 != null ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                        <div style={{ width: 60, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct52}%`, background: up ? '#00e676' : '#ff3b3b', borderRadius: 2 }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', width: 32 }}>{pct52.toFixed(0)}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, padding: '2px 8px', border: '1px solid var(--border)', borderRadius: 2, color: 'var(--text-sec)' }}>{s.sector}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
