import { useState, useEffect } from 'react';
import { Quote } from '../hooks/useLiveQuotes';

interface Position { sym: string; shares: number; avgCost: number; }

interface Props { quotes: Record<string, Quote>; token: string | null; }

export function PortfolioView({ quotes, token }: Props) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [sym, setSym] = useState(''); const [shares, setShares] = useState(''); const [cost, setCost] = useState('');
  const [adding, setAdding] = useState(false);

  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  useEffect(() => {
    if (token) fetch('/api/auth/portfolio', { headers }).then(r => r.json()).then((rows: any[]) =>
      setPositions(rows.map(p => ({ sym: p.symbol ?? p.sym, shares: p.shares, avgCost: p.avg_cost ?? p.avgCost })))
    ).catch(() => {});
    else {
      try { setPositions(JSON.parse(localStorage.getItem('ww_portfolio') ?? '[]')); } catch {}
    }
  }, [token]);

  const save = (updated: Position[]) => {
    setPositions(updated);
    if (!token) localStorage.setItem('ww_portfolio', JSON.stringify(updated));
  };

  const add = async () => {
    if (!sym || !shares || !cost) return;
    const pos: Position = { sym: sym.toUpperCase(), shares: parseFloat(shares), avgCost: parseFloat(cost) };
    if (token) {
      const res = await fetch('/api/auth/portfolio', { method: 'POST', headers, body: JSON.stringify(pos) });
      save(await res.json());
    } else save([...positions.filter(p => p.sym !== pos.sym), pos]);
    setSym(''); setShares(''); setCost(''); setAdding(false);
  };

  const remove = async (s: string) => {
    if (token) {
      const res = await fetch(`/api/auth/portfolio/${s}`, { method: 'DELETE', headers });
      save(await res.json());
    } else save(positions.filter(p => p.sym !== s));
  };

  const totalValue = positions.reduce((acc, p) => {
    const q = quotes[p.sym]; const price = q ? q.c : p.avgCost;
    return acc + price * p.shares;
  }, 0);

  const totalCost = positions.reduce((acc, p) => acc + p.avgCost * p.shares, 0);
  const totalPnL = totalValue - totalCost;
  const totalPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">PORTFOLIO TRACKER</div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'TOTAL VALUE', val: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'var(--text)' },
          { label: 'TOTAL COST',  val: `$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'var(--text-sec)' },
          { label: 'TOTAL P&L',   val: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: totalPnL >= 0 ? '#00e676' : '#ff3b3b' },
          { label: 'RETURN',      val: `${totalPct >= 0 ? '+' : ''}${totalPct.toFixed(2)}%`, color: totalPct >= 0 ? '#00e676' : '#ff3b3b' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Add position */}
      {!adding ? (
        <button onClick={() => setAdding(true)} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '10px 20px', borderRadius: 3, cursor: 'pointer', marginBottom: 16 }}>
          + ADD POSITION
        </button>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: 16, marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {[
            { label: 'SYMBOL', val: sym, set: setSym, placeholder: 'JPM', type: 'text' },
            { label: 'SHARES', val: shares, set: setShares, placeholder: '100', type: 'number' },
            { label: 'AVG COST ($)', val: cost, set: setCost, placeholder: '280.00', type: 'number' },
          ].map(f => (
            <div key={f.label} style={{ flex: 1, minWidth: 100 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>{f.label}</div>
              <input type={f.type} placeholder={f.placeholder} value={f.val} onChange={e => f.set(e.target.value)}
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <button onClick={add} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '8px 16px', borderRadius: 3, cursor: 'pointer' }}>ADD</button>
          <button onClick={() => setAdding(false)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-sec)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, padding: '8px 16px', borderRadius: 3, cursor: 'pointer' }}>CANCEL</button>
        </div>
      )}

      {/* Positions table */}
      {positions.length === 0 && <div className="dc-empty">No positions yet. Add your first holding above.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {positions.map(p => {
          const q = quotes[p.sym]; const price = q ? q.c : p.avgCost;
          const value = price * p.shares; const cost2 = p.avgCost * p.shares;
          const pnl = value - cost2; const pct = (pnl / cost2) * 100;
          const up = pnl >= 0;
          const dp = q?.dp ?? 0;
          return (
            <div key={p.sym} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `3px solid ${up ? '#00e676' : '#ff3b3b'}`, borderRadius: 4, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 60 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{p.sym}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)' }}>{p.shares} shares</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: dp >= 0 ? '#00e676' : '#ff3b3b' }}>${price.toFixed(2)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>avg ${p.avgCost.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>${value.toFixed(0)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>market value</div>
              </div>
              <div style={{ textAlign: 'right', width: 90 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: up ? '#00e676' : '#ff3b3b' }}>{up ? '+' : ''}${pnl.toFixed(0)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: up ? '#00e676' : '#ff3b3b' }}>{up ? '+' : ''}{pct.toFixed(2)}%</div>
              </div>
              <button onClick={() => remove(p.sym)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 8px', borderRadius: 2, cursor: 'pointer' }}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
