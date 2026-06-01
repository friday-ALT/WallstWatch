import { useEffect, useState } from 'react';
import { Quote } from '../hooks/useLiveQuotes';
import { fmtPrice, fmtPct, upColor } from '../utils/fmt';
import { Skeleton } from '../components/Skeleton';

type Conviction = 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
interface WatchItem { sym: string; target: number; conviction: Conviction; notes: string; addedAt: string; }

const CONVICTION_COLOR: Record<Conviction, string> = {
  'STRONG BUY':  '#00e676',
  'BUY':         '#4caf50',
  'NEUTRAL':     '#ffc107',
  'SELL':        '#ff6d00',
  'STRONG SELL': '#ff3b3b',
};

interface Props { quotes: Record<string, Quote>; token: string | null; }

const DEFAULT_LIST: WatchItem[] = [
  { sym: 'JPM', target: 310, conviction: 'BUY',    notes: 'Fortress capital, buyback, FOMC tailwind', addedAt: '2026-04-01' },
  { sym: 'GS',  target: 590, conviction: 'NEUTRAL', notes: 'Earnings risk from FICC volatility', addedAt: '2026-04-05' },
  { sym: 'NVDA',target: 1100,conviction: 'STRONG BUY','notes': 'AI capex supercycle, data centre demand', addedAt: '2026-04-10' },
];

export function WatchlistView({ quotes, token }: Props) {
  const [list, setList]   = useState<WatchItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm]   = useState({ sym: '', target: '', conviction: 'NEUTRAL' as Conviction, notes: '' });

  useEffect(() => {
    const load = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/watchlist', { headers: { Authorization: `Bearer ${token}` } });
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length) {
            setList(rows.map((r: any) => ({
              sym: r.symbol,
              target: r.target ?? 0,
              conviction: (r.conviction ?? 'NEUTRAL') as Conviction,
              notes: r.notes ?? '',
              addedAt: r.added_at?.slice(0, 10) ?? '',
            })));
            setLoaded(true);
            return;
          }
        } catch { /* fallback */ }
      }
      try { setList(JSON.parse(localStorage.getItem('ww_watchlist') ?? JSON.stringify(DEFAULT_LIST))); }
      catch { setList(DEFAULT_LIST); }
      setLoaded(true);
    };
    load();
  }, [token]);

  const save = async (updated: WatchItem[]) => {
    setList(updated);
    localStorage.setItem('ww_watchlist', JSON.stringify(updated));
    if (token) {
      const last = updated[updated.length - 1];
      if (last) {
        await fetch('/api/auth/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ symbol: last.sym, target: last.target, conviction: last.conviction, notes: last.notes }),
        }).catch(() => {});
      }
    }
  };

  const add = () => {
    if (!form.sym || !form.target) return;
    const item: WatchItem = { sym: form.sym.toUpperCase(), target: parseFloat(form.target), conviction: form.conviction, notes: form.notes, addedAt: new Date().toISOString().slice(0, 10) };
    save([...list.filter(l => l.sym !== item.sym), item]);
    setForm({ sym: '', target: '', conviction: 'NEUTRAL', notes: '' }); setAdding(false);
  };

  if (!loaded) return <div className="dc-scroll-area"><Skeleton rows={8} height={52} gap={8} /></div>;

  return (
    <div className="dc-scroll-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="dc-section-label" style={{ margin: 0 }}>WATCHLIST — {list.length} STOCKS</div>
        <button onClick={() => setAdding(!adding)} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '7px 14px', borderRadius: 3, cursor: 'pointer' }}>
          {adding ? '✕ CANCEL' : '+ ADD STOCK'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--red)', borderRadius: 4, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
            {[
              { label: 'SYMBOL', key: 'sym', placeholder: 'AAPL', type: 'text' },
              { label: 'PRICE TARGET ($)', key: 'target', placeholder: '250.00', type: 'number' },
            ].map(f => (
              <div key={f.key} style={{ flex: 1, minWidth: 100 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>{f.label}</div>
                <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 120 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>CONVICTION</div>
              <select value={form.conviction} onChange={e => setForm(p => ({ ...p, conviction: e.target.value as Conviction }))}
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none' }}>
                {Object.keys(CONVICTION_COLOR).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>THESIS / NOTES</div>
            <input placeholder="Why you're watching this..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={add} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '8px 20px', borderRadius: 3, cursor: 'pointer' }}>ADD TO WATCHLIST →</button>
        </div>
      )}

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 90px 90px 90px 120px 80px 32px', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
        {['SYM', 'COMPANY / THESIS', 'PRICE', 'TARGET', 'UPSIDE', 'CONVICTION', 'ADDED', ''].map(h => (
          <div key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 2 }}>{h}</div>
        ))}
      </div>

      {list.length === 0 && <div className="dc-empty">No stocks in watchlist. Add your first one above.</div>}

      {list.map((item, i) => {
        const q = quotes[item.sym];
        const price = q?.c ?? null;
        const upside = price ? ((item.target - price) / price) * 100 : null;
        const convColor = CONVICTION_COLOR[item.conviction];
        const up = q ? q.dp >= 0 : true;
        return (
          <div key={item.sym} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 90px 90px 90px 120px 80px 32px', gap: 8, padding: '11px 12px', borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : '#ffffff03', alignItems: 'center', transition: 'background .15s' }}
            onMouseOver={e => (e.currentTarget.style.background = '#ffffff06')}
            onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#ffffff03')}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{item.sym}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-sec)', lineHeight: 1.5 }}>{item.notes || '—'}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: upColor(q?.dp) }}>{fmtPrice(price)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{fmtPrice(item.target)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: upside == null ? 'var(--text-dim)' : upside >= 0 ? '#00e676' : '#ff3b3b' }}>
              {upside != null ? `${upside >= 0 ? '+' : ''}${upside.toFixed(1)}%` : '—'}
            </div>
            <div style={{ background: convColor + '18', border: `1px solid ${convColor}55`, color: convColor, fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, padding: '3px 8px', borderRadius: 2, letterSpacing: 1, textAlign: 'center' }}>{item.conviction}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{item.addedAt}</div>
            <button onClick={() => save(list.filter(l => l.sym !== item.sym))} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '3px 6px', borderRadius: 2, cursor: 'pointer' }}>✕</button>
          </div>
        );
      })}

      {/* Summary */}
      {list.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(CONVICTION_COLOR).map(([c, col]) => {
            const count = list.filter(l => l.conviction === c).length;
            if (!count) return null;
            return <div key={c} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: col, border: `1px solid ${col}55`, background: col + '11', padding: '3px 10px', borderRadius: 2 }}>{count} {c}</div>;
          })}
        </div>
      )}
    </div>
  );
}
