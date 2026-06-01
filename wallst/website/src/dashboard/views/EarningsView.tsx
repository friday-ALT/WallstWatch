import { useEffect, useState } from 'react';

interface EarningsItem {
  symbol: string; date: string;
  epsEstimate: number|null; epsActual: number|null;
  revenueEstimate: number|null; revenueActual: number|null;
  quarter: number; year: number;
}

function fmt(n: number|null) {
  if (n == null) return '—';
  if (Math.abs(n) >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n/1e6).toFixed(0)}M`;
  return `$${n.toFixed(2)}`;
}

export function EarningsView() {
  const [items, setItems] = useState<EarningsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const from = new Date().toISOString().slice(0,10);
    const to = new Date(Date.now()+30*86400_000).toISOString().slice(0,10);
    fetch(`/api/earnings?from=${from}&to=${to}`)
      .then(r=>r.json())
      .then(d=>setItems(Array.isArray(d) ? d : (d.earningsCalendar ?? [])))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">EARNINGS CALENDAR — NEXT 30 DAYS</div>
      {loading && <div className="dc-loading">Loading earnings data…</div>}
      {!loading && items.length===0 && <div className="dc-empty">No earnings data. Ensure backend is running with a valid Finnhub API key.</div>}
      <div className="dc-earnings-table">
        {items.slice(0,50).map((item,i) => {
          const beat = item.epsActual!=null && item.epsEstimate!=null ? item.epsActual>=item.epsEstimate : null;
          const statusColor = beat===null ? '#4a5568' : beat ? '#00e676' : '#ff3b3b';
          return (
            <div key={i} className="dc-earnings-row" style={{borderLeftColor:statusColor}}>
              <div className="dc-er-sym">{item.symbol}</div>
              <div className="dc-er-quarter">Q{item.quarter} {item.year}</div>
              <div className="dc-er-date">{item.date}</div>
              <div className="dc-er-stat"><span className="dc-stat-lbl">EPS EST</span><span className="dc-stat-val">{item.epsEstimate?.toFixed(2)??'—'}</span></div>
              <div className="dc-er-stat"><span className="dc-stat-lbl">EPS ACT</span><span className="dc-stat-val" style={{color:beat===null?'inherit':statusColor}}>{item.epsActual?.toFixed(2)??'—'}</span></div>
              <div className="dc-er-stat"><span className="dc-stat-lbl">REV EST</span><span className="dc-stat-val">{fmt(item.revenueEstimate)}</span></div>
              <div className="dc-er-stat"><span className="dc-stat-lbl">REV ACT</span><span className="dc-stat-val">{fmt(item.revenueActual)}</span></div>
              {beat !== null && <div className="dc-er-badge" style={{color:statusColor,borderColor:statusColor+'55',background:statusColor+'11'}}>{beat?'BEAT':'MISS'}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
