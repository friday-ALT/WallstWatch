import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Skeleton } from '../components/Skeleton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SectorData { symbol: string; name: string; c: number; dp: number; d: number; }

const SECTOR_MAP: Record<string,string> = {
  XLF:'Financials', XLK:'Technology', XLE:'Energy', XLV:'Healthcare',
  XLI:'Industrials', XLY:'Cons Disc', XLP:'Cons Staples',
  XLU:'Utilities', XLRE:'Real Estate', XLB:'Materials', XLC:'Comm Services',
};

const SECTOR_COLOR: Record<string,string> = {
  XLF:'#ff3b3b', XLK:'#2196f3', XLE:'#ffc107', XLV:'#00e676',
  XLI:'#b388ff', XLY:'#00bcd4', XLP:'#ff9800', XLU:'#ff6d00', XLRE:'#e91e63', XLB:'#4caf50', XLC:'#9c27b0',
};

export function SectorRotationView() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1d'|'1w'|'1m'>('1d');

  useEffect(() => {
    fetch('/api/sectors')
      .then(r=>r.json())
      .then(d=>setSectors(Array.isArray(d)?d:[]))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  },[]);

  const sorted = [...sectors].sort((a,b)=>b.dp-a.dp);

  const chartData = {
    labels: sorted.map(s=>SECTOR_MAP[s.symbol]??s.symbol),
    datasets: [{
      label: '% Change',
      data: sorted.map(s=>s.dp),
      backgroundColor: sorted.map(s=>(s.dp>=0?'rgba(0,230,118,0.75)':'rgba(255,59,59,0.75)')),
      borderColor: sorted.map(s=>(s.dp>=0?'#00e676':'#ff3b3b')),
      borderWidth: 1,
      borderRadius: 3,
    }],
  };

  const options: any = {
    responsive:true, maintainAspectRatio:false, indexAxis:'y',
    plugins: {
      legend:{ display:false },
      tooltip:{
        backgroundColor:'#141820', borderColor:'#2a3040', borderWidth:1,
        titleColor:'#e8ecf0', bodyColor:'#8b95a5',
        titleFont:{ family:'JetBrains Mono', size:11 },
        bodyFont:{ family:'JetBrains Mono', size:10 },
        callbacks:{ label:(ctx:any)=>`${ctx.parsed.x>=0?'+':''}${ctx.parsed.x.toFixed(2)}%` },
      },
    },
    scales:{
      x:{ grid:{color:'#1e2530'}, ticks:{color:'#8b95a5',font:{family:'JetBrains Mono',size:9}, callback:(v:any)=>`${v>0?'+':''}${v}%`}, },
      y:{ grid:{color:'#1e2530'}, ticks:{color:'#8b95a5',font:{family:'JetBrains Mono',size:9}} },
    },
  };

  const topSector = sorted[0];
  const bottomSector = sorted[sorted.length-1];
  const advancingSectors = sectors.filter(s=>s.dp>0).length;

  return (
    <div className="dc-scroll-area">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
        <div>
          <div className="dc-section-label">SECTOR ROTATION — GICS PERFORMANCE</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-dim)' }}>
            {advancingSectors} of {sectors.length} sectors advancing
          </div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {(['1d','1w','1m'] as const).map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{ background:period===p?'var(--red)':'none', border:`1px solid ${period===p?'var(--red)':'var(--border)'}`, color:period===p?'#fff':'var(--text-dim)', fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, padding:'4px 10px', borderRadius:2, cursor:'pointer' }}>
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Rotation summary */}
      {!loading && sectors.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:20 }}>
          {[
            { l:'LEADING SECTOR', v:SECTOR_MAP[topSector?.symbol]??'—', sub:`${topSector?.dp>=0?'+':''}${topSector?.dp?.toFixed(2)??'—'}%`, c:'#00e676' },
            { l:'LAGGING SECTOR', v:SECTOR_MAP[bottomSector?.symbol]??'—', sub:`${bottomSector?.dp>=0?'+':''}${bottomSector?.dp?.toFixed(2)??'—'}%`, c:'#ff3b3b' },
            { l:'ADVANCING / DECLINING', v:`${advancingSectors} / ${sectors.length-advancingSectors}`, sub:'sectors today', c: advancingSectors > sectors.length/2 ? '#00e676':'#ff3b3b' },
          ].map(s=>(
            <div key={s.l} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderTop:`2px solid ${s.c}`, borderRadius:4, padding:'12px 14px' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--text-dim)', letterSpacing:2, marginBottom:6 }}>{s.l}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:16, fontWeight:700, color:s.c }}>{s.v}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-dim)', marginTop:3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {loading && <Skeleton rows={6} height={44} gap={8}/>}

      {/* Bar chart */}
      {!loading && sectors.length>0 && (
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:4, padding:16, height:320, marginBottom:20 }}>
          <Bar data={chartData} options={options}/>
        </div>
      )}

      {/* Detailed sector cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
        {sorted.map(s=>{
          const up = s.dp >= 0;
          return (
            <div key={s.symbol} style={{ background:'var(--bg-card)', border:`1px solid ${SECTOR_COLOR[s.symbol]??'var(--border)'}33`, borderLeft:`3px solid ${SECTOR_COLOR[s.symbol]??'var(--border)'}`, borderRadius:4, padding:'10px 12px' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{s.symbol}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text-dim)', marginBottom:8 }}>{SECTOR_MAP[s.symbol]}</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:15, fontWeight:700, color:up?'#00e676':'#ff3b3b' }}>
                {up?'+':''}{s.dp?.toFixed(2)??'—'}%
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-dim)', marginTop:2 }}>
                ${s.c?.toFixed(2)??'—'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Capital flow narrative */}
      {!loading && sorted.length>2 && (
        <div style={{ marginTop:20, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:4, padding:'14px 16px' }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, marginBottom:8 }}>◆ ROTATION SIGNAL</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-sec)', lineHeight:1.8 }}>
            {topSector && `Capital is rotating ${advancingSectors > sectors.length/2 ? 'broadly' : 'selectively'} into ${SECTOR_MAP[topSector.symbol]} (+${topSector.dp.toFixed(2)}%), `}
            {bottomSector && `while ${SECTOR_MAP[bottomSector.symbol]} leads the laggards (${bottomSector.dp.toFixed(2)}%). `}
            {advancingSectors > sectors.length * 0.7 ? 'Broad-based advance suggests risk-on sentiment.' :
             advancingSectors < sectors.length * 0.3 ? 'Broad-based decline signals risk-off rotation.' :
             'Mixed performance suggests sector-specific rather than macro drivers.'}
          </div>
        </div>
      )}
    </div>
  );
}
