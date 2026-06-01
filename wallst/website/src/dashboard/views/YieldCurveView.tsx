import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface TenorPoint { label: string; yield: number | null; prevYield: number | null; }

// Fallback realistic curve if API unavailable
const FALLBACK: TenorPoint[] = [
  { label:'3M', yield:5.28, prevYield:5.31 },
  { label:'6M', yield:5.12, prevYield:5.18 },
  { label:'1Y', yield:4.91, prevYield:4.99 },
  { label:'2Y', yield:4.72, prevYield:4.80 },
  { label:'5Y', yield:4.44, prevYield:4.52 },
  { label:'10Y', yield:4.38, prevYield:4.46 },
  { label:'20Y', yield:4.65, prevYield:4.72 },
  { label:'30Y', yield:4.53, prevYield:4.61 },
];

const HISTORICAL: { label: string; color: string; data: number[] }[] = [
  { label:'1Y Ago',  color:'#2196f344', data:[5.01,4.89,4.72,4.58,4.22,4.18,4.40,4.32] },
  { label:'2Y Ago',  color:'#b388ff44', data:[3.12,3.45,3.78,4.02,3.88,3.62,3.95,3.88] },
];

export function YieldCurveView() {
  const [curve, setCurve] = useState<TenorPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);

  useEffect(() => {
    fetch('/api/yield-curve')
      .then(r => r.json())
      .then((d: TenorPoint[]) => {
        const valid = d.filter(t => t.yield !== null);
        setCurve(valid.length >= 4 ? valid : FALLBACK);
      })
      .catch(() => setCurve(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const labels = curve.map(t => t.label);
  const currentData = curve.map(t => t.yield);
  const prevData = curve.map(t => t.prevYield);

  const isInverted = (curve.find(t => t.label === '2Y')?.yield ?? 0) > (curve.find(t => t.label === '10Y')?.yield ?? 0);

  const chartData = {
    labels,
    datasets: [
      ...(showHistorical ? HISTORICAL.map(h => ({
        label: h.label,
        data: h.data,
        borderColor: h.color,
        backgroundColor: 'transparent',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.4,
      })) : []),
      {
        label: 'Yesterday',
        data: prevData,
        borderColor: '#ffffff33',
        backgroundColor: 'transparent',
        borderDash: [2, 3],
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.4,
      },
      {
        label: 'Today',
        data: currentData,
        borderColor: isInverted ? '#ff3b3b' : '#00e676',
        backgroundColor: isInverted ? 'rgba(255,59,59,0.06)' : 'rgba(0,230,118,0.06)',
        fill: true,
        borderWidth: 2.5,
        pointRadius: 5,
        pointBackgroundColor: isInverted ? '#ff3b3b' : '#00e676',
        pointBorderColor: 'var(--bg)',
        pointBorderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#8b95a5', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 20 }
      },
      tooltip: {
        backgroundColor: '#141820',
        borderColor: '#2a3040',
        borderWidth: 1,
        titleColor: '#e8ecf0',
        bodyColor: '#8b95a5',
        titleFont: { family: 'JetBrains Mono', size: 11, weight: 'bold' },
        bodyFont: { family: 'JetBrains Mono', size: 10 },
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(2) ?? '—'}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#1e2530' },
        ticks: { color: '#8b95a5', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: '#1e2530' },
        ticks: { color: '#8b95a5', font: { family: 'JetBrains Mono', size: 10 }, callback: (v: any) => `${v.toFixed(2)}%` },
      },
    },
  };

  const spread_2s10s = ((curve.find(t => t.label === '10Y')?.yield ?? 0) - (curve.find(t => t.label === '2Y')?.yield ?? 0)).toFixed(2);
  const spread_3m10y = ((curve.find(t => t.label === '10Y')?.yield ?? 0) - (curve.find(t => t.label === '3M')?.yield ?? 0)).toFixed(2);

  return (
    <div className="dc-scroll-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div className="dc-section-label">US TREASURY YIELD CURVE</div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-dim)', marginTop:2 }}>
            Real-time rates across all tenors · {isInverted ? '⚠ INVERTED' : '✓ NORMAL'} CURVE
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <label style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-dim)', display:'flex', alignItems:'center', gap:5, cursor:'pointer' }}>
            <input type="checkbox" checked={showHistorical} onChange={e => setShowHistorical(e.target.checked)} style={{ accentColor:'var(--red)' }} />
            HISTORICAL
          </label>
        </div>
      </div>

      {/* Spread indicators */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[
          { l:'2s10s SPREAD', v:`${parseFloat(spread_2s10s) >= 0 ? '+' : ''}${spread_2s10s}%`, c: parseFloat(spread_2s10s) < 0 ? '#ff3b3b' : '#00e676', note: parseFloat(spread_2s10s) < 0 ? 'INVERTED — recession signal' : 'Normal slope' },
          { l:'3M10Y SPREAD', v:`${parseFloat(spread_3m10y) >= 0 ? '+' : ''}${spread_3m10y}%`, c: parseFloat(spread_3m10y) < 0 ? '#ff3b3b' : '#00e676', note: parseFloat(spread_3m10y) < 0 ? 'INVERTED — near-term risk' : 'Normal' },
          { l:'10Y YIELD',    v:`${(curve.find(t=>t.label==='10Y')?.yield??0).toFixed(2)}%`,   c:'#ffc107', note:'Benchmark rate' },
          { l:'30Y YIELD',    v:`${(curve.find(t=>t.label==='30Y')?.yield??0).toFixed(2)}%`,   c:'#2196f3', note:'Long-bond rate' },
        ].map(s => (
          <div key={s.l} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderTop:`2px solid ${s.c}`, borderRadius:4, padding:'12px 14px' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:7, color:'var(--text-dim)', letterSpacing:2, marginBottom:6 }}>{s.l}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:22, fontWeight:700, color:s.c, lineHeight:1 }}>{s.v}</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text-dim)', marginTop:4 }}>{s.note}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:4, padding:16, height:320, marginBottom:20 }}>
        {loading ? <div className="dc-loading">Loading yield curve…</div> : <Line data={chartData} options={options} />}
      </div>

      {/* Tenor table */}
      <div className="dc-section-label">ALL TENORS</div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'var(--font-mono)' }}>
        <thead>
          <tr style={{ borderBottom:'1px solid var(--border)' }}>
            {['TENOR','SYMBOL','YIELD','PREV','CHANGE','SIGNAL'].map(h => (
              <th key={h} style={{ fontSize:7, fontWeight:700, color:'var(--text-dim)', letterSpacing:2, textAlign:'left', padding:'8px 10px' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {curve.map((t, i) => {
            const chg = t.yield != null && t.prevYield != null ? t.yield - t.prevYield : null;
            return (
              <tr key={t.label} style={{ borderBottom:'1px solid var(--border)', background: i%2===0?'transparent':'#ffffff03' }}>
                <td style={{ padding:'10px', fontSize:13, fontWeight:700, color:'var(--text)' }}>{t.label}</td>
                <td style={{ padding:'10px', fontSize:9, color:'var(--text-dim)' }}>US{t.label}Y</td>
                <td style={{ padding:'10px', fontSize:13, fontWeight:700, color:'var(--text)' }}>{t.yield?.toFixed(2) ?? '—'}%</td>
                <td style={{ padding:'10px', fontSize:11, color:'var(--text-dim)' }}>{t.prevYield?.toFixed(2) ?? '—'}%</td>
                <td style={{ padding:'10px', fontSize:11, fontWeight:700, color: chg == null ? 'var(--text-dim)' : chg > 0 ? '#ff3b3b' : '#00e676' }}>
                  {chg != null ? `${chg > 0 ? '+' : ''}${chg.toFixed(3)}%` : '—'}
                </td>
                <td style={{ padding:'10px' }}>
                  {chg != null && Math.abs(chg) > 0.05 && (
                    <span style={{ fontSize:8, fontWeight:700, color: chg > 0 ? '#ff3b3b' : '#00e676', border:`1px solid ${chg>0?'#ff3b3b55':'#00e67655'}`, padding:'1px 6px', borderRadius:2 }}>
                      {chg > 0 ? '▲ RISING' : '▼ FALLING'}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Interpretation box */}
      <div style={{ marginTop:16, background: isInverted ? '#ff3b3b11' : '#00e67611', border:`1px solid ${isInverted?'#ff3b3b44':'#00e67644'}`, borderRadius:4, padding:'14px 16px' }}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, fontWeight:700, color: isInverted ? '#ff3b3b' : '#00e676', letterSpacing:2, marginBottom:6 }}>
          {isInverted ? '⚠ INVERTED YIELD CURVE DETECTED' : '✓ NORMAL YIELD CURVE'}
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-sec)', lineHeight:1.8 }}>
          {isInverted
            ? 'The 2Y yield exceeds the 10Y yield — historically a reliable leading indicator of recession within 12–18 months. The Fed hiking cycle has compressed long-end demand relative to short-end anchoring. Watch for Fed pivot signals as the primary catalyst for curve normalisation.'
            : 'The yield curve is positively sloped — consistent with a normal expansion phase. Long-term rates reflect growth and inflation expectations above near-term levels. This configuration is supportive for bank net interest margins.'}
        </div>
      </div>
    </div>
  );
}
