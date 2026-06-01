import { useEffect, useState } from 'react';
import { Skeleton } from '../components/Skeleton';
import { fmtPct } from '../utils/fmt';

const SYMBOLS = ['JPM','GS','MS','BAC','C','WFC','AAPL','MSFT','NVDA','GOOGL','AMZN','META'];

interface EarningsQ { period: string; actual: number|null; estimate: number|null; surprise: number|null; surprisePct: number|null; }

export function BeatMissView() {
  const [sym, setSym] = useState('JPM');
  const [history, setHistory] = useState<EarningsQ[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true); setHistory([]);
    fetch(`/api/earnings/history/${sym}`)
      .then(r=>r.json())
      .then((d: any[]) => {
        const rows = (Array.isArray(d) ? d : []).slice(0,8).map((e:any) => ({
          period: e.period ?? e.date ?? '—',
          actual: e.actual ?? null,
          estimate: e.estimate ?? null,
          surprise: e.actual != null && e.estimate != null ? e.actual - e.estimate : null,
          surprisePct: e.actual != null && e.estimate != null && e.estimate !== 0
            ? ((e.actual - e.estimate) / Math.abs(e.estimate)) * 100 : null,
        }));
        setHistory(rows);
      })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, [sym]);

  const beats = history.filter(h => (h.surprise ?? 0) > 0).length;
  const misses = history.filter(h => (h.surprise ?? 0) < 0).length;
  const avgSurprise = history.filter(h=>h.surprisePct!=null).length
    ? history.filter(h=>h.surprisePct!=null).reduce((s,h)=>s+h.surprisePct!,0)/history.filter(h=>h.surprisePct!=null).length
    : null;

  return (
    <div className="dc-scroll-area">
      {/* Symbol picker */}
      <div className="dc-sym-bar" style={{ marginBottom:16 }}>
        {SYMBOLS.map(s=>(
          <button key={s} className={`dc-sym-chip${sym===s?' active':''}`} onClick={()=>setSym(s)}>{s}</button>
        ))}
      </div>

      <div className="dc-section-label">{sym} — EARNINGS BEAT / MISS HISTORY (LAST 8 QUARTERS)</div>

      {/* Summary stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[
          { l:'BEATS', v: beats.toString(), c:'#00e676' },
          { l:'MISSES', v: misses.toString(), c:'#ff3b3b' },
          { l:'WIN RATE', v: history.length ? `${Math.round(beats/history.length*100)}%` : '—', c: beats>misses?'#00e676':'#ff3b3b' },
          { l:'AVG SURPRISE', v: avgSurprise != null ? fmtPct(avgSurprise) : '—', c: (avgSurprise??0)>=0?'#00e676':'#ff3b3b' },
        ].map(s=>(
          <div key={s.l} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderTop:`2px solid ${s.c}`, borderRadius:4, padding:'12px 14px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--text-dim)', letterSpacing:2, marginBottom:6 }}>{s.l}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:24, fontWeight:700, color:s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {loading && <Skeleton rows={8} height={56} gap={8}/>}

      {!loading && history.length===0 && (
        <div className="dc-empty">No earnings history available for {sym}. Requires a valid Finnhub API key.</div>
      )}

      {/* Beat/miss timeline */}
      {!loading && history.length > 0 && (
        <>
          {/* Visual bar chart */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:4, padding:16, marginBottom:16 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text-dim)', letterSpacing:2, marginBottom:12 }}>EPS SURPRISE % BY QUARTER</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:80 }}>
              {[...history].reverse().map((h,i)=>{
                const pct = h.surprisePct ?? 0;
                const maxAbs = Math.max(...history.map(x=>Math.abs(x.surprisePct??0)), 1);
                const barH = Math.abs(pct) / maxAbs * 68;
                const color = pct >= 0 ? '#00e676' : '#ff3b3b';
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:color, fontWeight:700 }}>
                      {pct!==0 ? `${pct>0?'+':''}${pct.toFixed(1)}%` : '—'}
                    </span>
                    <div style={{ width:'100%', display:'flex', flexDirection:'column', justifyContent:pct>=0?'flex-end':'flex-start', height:60 }}>
                      <div style={{ background:color, borderRadius:2, height:barH || 2, opacity:0.85 }}/>
                    </div>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--text-dim)', textAlign:'center', lineHeight:1.2 }}>
                      {h.period.slice(0,7)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detail table */}
          <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--font-mono)' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)' }}>
                {['QUARTER','EPS ESTIMATE','EPS ACTUAL','SURPRISE','SURPRISE %','RESULT'].map(h=>(
                  <th key={h} style={{ fontSize:7, fontWeight:700, color:'var(--text-dim)', letterSpacing:1.5, textAlign:'left', padding:'8px 10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map((h,i)=>{
                const beat = h.surprise != null ? h.surprise > 0 : null;
                const c = beat == null ? 'var(--text-dim)' : beat ? '#00e676' : '#ff3b3b';
                return (
                  <tr key={i} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'transparent':'#ffffff03' }}>
                    <td style={{ padding:'10px', fontSize:11, fontWeight:700, color:'var(--text)' }}>{h.period}</td>
                    <td style={{ padding:'10px', fontSize:11, color:'var(--text-sec)' }}>{h.estimate?.toFixed(2)??'—'}</td>
                    <td style={{ padding:'10px', fontSize:11, fontWeight:700, color:c }}>{h.actual?.toFixed(2)??'—'}</td>
                    <td style={{ padding:'10px', fontSize:11, fontWeight:700, color:c }}>{h.surprise!=null?(h.surprise>0?'+':'')+h.surprise.toFixed(2):'—'}</td>
                    <td style={{ padding:'10px', fontSize:11, fontWeight:700, color:c }}>{h.surprisePct!=null?fmtPct(h.surprisePct):'—'}</td>
                    <td style={{ padding:'10px' }}>
                      {beat!=null && <span style={{ fontSize:8, fontWeight:700, color:c, border:`1px solid ${c}55`, padding:'2px 8px', borderRadius:2 }}>{beat?'BEAT':'MISS'}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
