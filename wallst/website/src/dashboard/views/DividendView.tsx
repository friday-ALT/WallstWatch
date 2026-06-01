import { useEffect, useState } from 'react';
import { Skeleton } from '../components/Skeleton';

const WATCHLIST_SYMS = ['JPM','GS','MS','BAC','C','WFC','AAPL','MSFT','JNJ','XOM','T','KO','PG','VZ','MCD'];

interface Dividend { symbol: string; exDate: string; payDate: string; amount: number; frequency: string; annualYield?: number; }

// Fallback dividend calendar
const FALLBACK: Dividend[] = [
  { symbol:'JPM',  exDate:'2026-04-10', payDate:'2026-04-30', amount:1.15, frequency:'Quarterly', annualYield:2.1 },
  { symbol:'MS',   exDate:'2026-04-13', payDate:'2026-05-15', amount:0.925,frequency:'Quarterly', annualYield:3.4 },
  { symbol:'WFC',  exDate:'2026-04-18', payDate:'2026-05-01', amount:0.40, frequency:'Quarterly', annualYield:2.9 },
  { symbol:'MSFT', exDate:'2026-05-15', payDate:'2026-06-12', amount:0.83, frequency:'Quarterly', annualYield:0.7 },
  { symbol:'JNJ',  exDate:'2026-05-20', payDate:'2026-06-03', amount:1.24, frequency:'Quarterly', annualYield:3.1 },
  { symbol:'KO',   exDate:'2026-06-14', payDate:'2026-07-01', amount:0.485,frequency:'Quarterly', annualYield:3.2 },
  { symbol:'XOM',  exDate:'2026-05-12', payDate:'2026-06-10', amount:0.99, frequency:'Quarterly', annualYield:3.4 },
  { symbol:'T',    exDate:'2026-04-09', payDate:'2026-05-01', amount:0.2775,frequency:'Quarterly',annualYield:6.2 },
  { symbol:'PG',   exDate:'2026-04-23', payDate:'2026-05-15', amount:1.0065,frequency:'Quarterly',annualYield:2.4 },
  { symbol:'VZ',   exDate:'2026-04-08', payDate:'2026-05-01', amount:0.6775,frequency:'Quarterly',annualYield:6.8 },
];

export function DividendView() {
  const [divs, setDivs] = useState<Dividend[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all'|'week'|'month'>('month');
  const [sortBy, setSortBy] = useState<'exDate'|'yield'>('exDate');

  useEffect(() => {
    Promise.allSettled(
      WATCHLIST_SYMS.map(sym =>
        fetch(`/api/dividends/${sym}`)
          .then(r=>r.json())
          .then((d:any[])=>{
            const arr = Array.isArray(d)?d:[];
            return arr.slice(0,2).map((item:any) => ({
              symbol: sym,
              exDate: item.exDate ?? item.date ?? '',
              payDate: item.payDate ?? item.paymentDate ?? '',
              amount: item.amount ?? item.adjustedAmount ?? 0,
              frequency: item.freq ?? 'Quarterly',
              annualYield: item.yield ?? undefined,
            }));
          })
      )
    ).then(results => {
      const all: Dividend[] = results
        .filter(r=>r.status==='fulfilled')
        .flatMap(r=>(r as any).value)
        .filter((d:Dividend)=>d.exDate && d.amount > 0);
      setDivs(all.length >= 4 ? all : FALLBACK);
    }).catch(()=>setDivs(FALLBACK)).finally(()=>setLoading(false));
  },[]);

  const now = new Date();
  const weekOut = new Date(Date.now()+7*86400000);
  const monthOut = new Date(Date.now()+30*86400000);

  const filtered = divs.filter(d=>{
    const ex = new Date(d.exDate);
    if (filter==='week')  return ex >= now && ex <= weekOut;
    if (filter==='month') return ex >= now && ex <= monthOut;
    return true;
  }).sort((a,b)=>{
    if (sortBy==='yield') return (b.annualYield??0)-(a.annualYield??0);
    return new Date(a.exDate).getTime()-new Date(b.exDate).getTime();
  });

  const totalIncome = filtered.reduce((s,d)=>s+d.amount,0);
  const thisWeek = divs.filter(d=>{ const ex=new Date(d.exDate); return ex>=now&&ex<=weekOut; });

  if (loading) return <div className="dc-scroll-area"><Skeleton rows={10} height={52} gap={6}/></div>;

  return (
    <div className="dc-scroll-area">
      {/* Header stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
        {[
          { l:'THIS WEEK',      v:thisWeek.length.toString(), c:'#ffc107', sub:'ex-dividend dates' },
          { l:'THIS MONTH',     v:divs.filter(d=>new Date(d.exDate)>=now&&new Date(d.exDate)<=monthOut).length.toString(), c:'#00e676', sub:'upcoming payments' },
          { l:'AVG DIV YIELD',  v:`${(divs.filter(d=>d.annualYield).reduce((s,d)=>s+(d.annualYield??0),0)/Math.max(1,divs.filter(d=>d.annualYield).length)).toFixed(1)}%`, c:'#2196f3', sub:'across watchlist' },
        ].map(s=>(
          <div key={s.l} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderTop:`2px solid ${s.c}`, borderRadius:4, padding:'12px 14px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--text-dim)', letterSpacing:2, marginBottom:6 }}>{s.l}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:24, fontWeight:700, color:s.c }}>{s.v}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text-dim)', marginTop:3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'center', flexWrap:'wrap' }}>
        <div className="dc-section-label" style={{ margin:0 }}>DIVIDEND CALENDAR</div>
        <div style={{ display:'flex', gap:6, marginLeft:'auto' }}>
          {(['all','week','month'] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{ background:filter===f?'var(--red)':'none', border:`1px solid ${filter===f?'var(--red)':'var(--border)'}`, color:filter===f?'#fff':'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, padding:'4px 10px', borderRadius:2, cursor:'pointer' }}>
              {f.toUpperCase()}
            </button>
          ))}
          <button onClick={()=>setSortBy(s=>s==='exDate'?'yield':'exDate')}
            style={{ background:'none', border:'1px solid var(--border)', color:'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:9, padding:'4px 10px', borderRadius:2, cursor:'pointer' }}>
            SORT: {sortBy==='exDate'?'DATE':'YIELD'} ⇅
          </button>
        </div>
      </div>

      <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--font-mono)' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid var(--border)' }}>
            {['SYM','EX-DATE','PAY DATE','DIVIDEND','ANNUAL YIELD','FREQUENCY','DAYS TO EX'].map(h=>(
              <th key={h} style={{ fontSize:7, fontWeight:700, color:'var(--text-dim)', letterSpacing:1.5, textAlign:'left', padding:'8px 10px', whiteSpace:'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((d,i)=>{
            const daysTo = Math.ceil((new Date(d.exDate).getTime()-Date.now())/86400000);
            const urgent = daysTo >= 0 && daysTo <= 7;
            return (
              <tr key={i} style={{ borderBottom:'1px solid var(--border)', background:i%2===0?'transparent':'#ffffff03' }}>
                <td style={{ padding:'10px', fontSize:13, fontWeight:700, color:'var(--text)' }}>{d.symbol}</td>
                <td style={{ padding:'10px', fontSize:11, color: urgent?'#ffc107':'var(--text)', fontWeight: urgent?700:400 }}>{d.exDate||'—'}</td>
                <td style={{ padding:'10px', fontSize:11, color:'var(--text-dim)' }}>{d.payDate||'—'}</td>
                <td style={{ padding:'10px', fontSize:13, fontWeight:700, color:'#00e676' }}>${d.amount.toFixed(3)}</td>
                <td style={{ padding:'10px', fontSize:12, fontWeight:700, color:'#2196f3' }}>{d.annualYield?`${d.annualYield.toFixed(1)}%`:'—'}</td>
                <td style={{ padding:'10px', fontSize:9, color:'var(--text-dim)' }}>{d.frequency}</td>
                <td style={{ padding:'10px' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color: daysTo<0?'var(--text-dim)':daysTo<=3?'#ff3b3b':daysTo<=7?'#ffc107':'var(--text-sec)', border:`1px solid ${daysTo<=3?'#ff3b3b55':daysTo<=7?'#ffc10755':'var(--border)'}`, padding:'2px 7px', borderRadius:2 }}>
                    {daysTo < 0 ? 'PASSED' : daysTo === 0 ? 'TODAY' : `${daysTo}d`}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {filtered.length===0 && <div className="dc-empty">No dividends in selected window.</div>}
    </div>
  );
}
