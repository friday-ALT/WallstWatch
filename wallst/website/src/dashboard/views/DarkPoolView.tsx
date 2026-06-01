import { useEffect, useState } from 'react';
import { fmtNum, fmtPct } from '../utils/fmt';
import { Skeleton } from '../components/Skeleton';

interface DpRecord { sym: string; company: string; dpVolume: number; totalVolume: number; dpPct: number; shortFloat: number; shortChange: number; daysTocover: number; borrowRate: number; sentiment: 'BEARISH' | 'NEUTRAL' | 'BULLISH'; }

const DP_DATA: DpRecord[] = [
  { sym: 'JPM', company:'JPMorgan Chase',     dpVolume:12.4e6, totalVolume:38.2e6, dpPct:32.5, shortFloat:0.8,  shortChange:-0.2, daysTocover:1.1, borrowRate:0.3,  sentiment:'BULLISH' },
  { sym: 'GS',  company:'Goldman Sachs',      dpVolume:8.1e6,  totalVolume:22.7e6, dpPct:35.7, shortFloat:2.1,  shortChange:+0.4, daysTocover:2.3, borrowRate:0.8,  sentiment:'NEUTRAL' },
  { sym: 'MS',  company:'Morgan Stanley',     dpVolume:6.8e6,  totalVolume:17.4e6, dpPct:39.1, shortFloat:1.9,  shortChange:-0.5, daysTocover:1.9, borrowRate:0.5,  sentiment:'BULLISH' },
  { sym: 'BAC', company:'Bank of America',    dpVolume:22.3e6, totalVolume:64.1e6, dpPct:34.8, shortFloat:0.6,  shortChange:-0.1, daysTocover:0.8, borrowRate:0.3,  sentiment:'BULLISH' },
  { sym: 'C',   company:'Citigroup',          dpVolume:9.4e6,  totalVolume:29.8e6, dpPct:31.5, shortFloat:1.2,  shortChange:+0.3, daysTocover:1.4, borrowRate:0.4,  sentiment:'NEUTRAL' },
  { sym: 'WFC', company:'Wells Fargo',        dpVolume:7.2e6,  totalVolume:23.6e6, dpPct:30.5, shortFloat:1.5,  shortChange:-0.2, daysTocover:1.7, borrowRate:0.5,  sentiment:'NEUTRAL' },
  { sym: 'USB', company:'US Bancorp',         dpVolume:3.8e6,  totalVolume:11.9e6, dpPct:31.9, shortFloat:2.8,  shortChange:+1.1, daysTocover:3.2, borrowRate:1.2,  sentiment:'BEARISH' },
  { sym: 'PNC', company:'PNC Financial',      dpVolume:2.9e6,  totalVolume:8.7e6,  dpPct:33.3, shortFloat:2.2,  shortChange:+0.8, daysTocover:2.6, borrowRate:0.9,  sentiment:'BEARISH' },
  { sym: 'TFC', company:'Truist Financial',   dpVolume:4.1e6,  totalVolume:14.2e6, dpPct:28.9, shortFloat:3.4,  shortChange:+1.6, daysTocover:3.8, borrowRate:2.1,  sentiment:'BEARISH' },
  { sym: 'SCHW',company:'Charles Schwab',     dpVolume:5.7e6,  totalVolume:18.3e6, dpPct:31.1, shortFloat:4.2,  shortChange:+0.9, daysTocover:4.1, borrowRate:1.8,  sentiment:'BEARISH' },
  { sym: 'AAPL',company:'Apple Inc.',         dpVolume:38.4e6, totalVolume:98.2e6, dpPct:39.1, shortFloat:0.5,  shortChange:-0.1, daysTocover:0.6, borrowRate:0.1,  sentiment:'BULLISH' },
  { sym: 'MSFT',company:'Microsoft',          dpVolume:19.2e6, totalVolume:54.7e6, dpPct:35.1, shortFloat:0.4,  shortChange: 0,   daysTocover:0.5, borrowRate:0.1,  sentiment:'BULLISH' },
  { sym: 'NVDA',company:'NVIDIA',             dpVolume:41.8e6, totalVolume:112.4e6,dpPct:37.2, shortFloat:1.8,  shortChange:+0.4, daysTocover:1.2, borrowRate:0.6,  sentiment:'NEUTRAL' },
  { sym: 'SPY', company:'S&P 500 ETF',        dpVolume:88.4e6, totalVolume:198.6e6,dpPct:44.5, shortFloat:0.9,  shortChange:-0.1, daysTocover:0.3, borrowRate:0.1,  sentiment:'NEUTRAL' },
];

const SENTIMENT_COLOR: Record<string, string> = { BULLISH: '#00e676', NEUTRAL: '#ffc107', BEARISH: '#ff3b3b' };
type Sort = keyof DpRecord;

export function DarkPoolView() {
  const [loaded, setLoaded] = useState(false);
  const [sort, setSort] = useState<Sort>('dpPct');
  const [asc, setAsc] = useState(false);
  const [sentFilter, setSentFilter] = useState<string>('ALL');

  useEffect(() => { setTimeout(() => setLoaded(true), 500); }, []);

  const toggleSort = (col: Sort) => { if (sort === col) setAsc(a => !a); else { setSort(col); setAsc(false); } };
  const sorted = [...DP_DATA]
    .filter(r => sentFilter === 'ALL' || r.sentiment === sentFilter)
    .sort((a, b) => {
      const av = a[sort] as number; const bv = b[sort] as number;
      return asc ? av - bv : bv - av;
    });

  if (!loaded) return <div className="dc-scroll-area"><Skeleton rows={10} height={44} gap={6} /></div>;

  const SortBtn = ({ col }: { col: Sort }) => (
    <span style={{ cursor: 'pointer', userSelect: 'none', color: sort === col ? 'var(--red)' : 'inherit' }} onClick={() => toggleSort(col)}>
      {sort === col ? (asc ? '▲' : '▼') : '⇅'}
    </span>
  );

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">DARK POOL PRINTS & SHORT INTEREST TRACKER</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginBottom: 16, lineHeight: 1.8 }}>
        Dark pool volume = off-exchange institutional block trades. High dark pool % = smart money accumulation. Short interest = % of float sold short; high short + rising = bearish pressure.
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', alignSelf: 'center' }}>SENTIMENT:</div>
        {['ALL','BULLISH','NEUTRAL','BEARISH'].map(s => (
          <button key={s} onClick={() => setSentFilter(s)}
            style={{ background: sentFilter === s ? (SENTIMENT_COLOR[s] ?? 'var(--red)') : 'var(--bg)', border: `1px solid ${sentFilter === s ? (SENTIMENT_COLOR[s] ?? 'var(--red)') : 'var(--border)'}`, color: sentFilter === s ? '#000' : 'var(--text-sec)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, padding: '5px 12px', borderRadius: 2, cursor: 'pointer', letterSpacing: 1 }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {[
                { label: 'SYM',           key: 'sym'       as Sort },
                { label: 'COMPANY',       key: 'company'   as Sort },
                { label: 'DP VOLUME',     key: 'dpVolume'  as Sort },
                { label: 'DP %',          key: 'dpPct'     as Sort },
                { label: 'SHORT FLOAT %', key: 'shortFloat'as Sort },
                { label: 'CHG 1W',        key: 'shortChange'as Sort},
                { label: 'DAYS TO COVER', key: 'daysTocover'as Sort},
                { label: 'BORROW RATE',   key: 'borrowRate' as Sort},
                { label: 'SENTIMENT',     key: 'sentiment'  as Sort},
              ].map(h => (
                <th key={h.key} style={{ fontSize: 7, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 2, textAlign: 'left', padding: '8px 10px', whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={() => toggleSort(h.key)}>
                  {h.label} <SortBtn col={h.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const c = SENTIMENT_COLOR[r.sentiment];
              return (
                <tr key={r.sym} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : '#ffffff03' }}
                  onMouseOver={e => (e.currentTarget.style.background = '#ffffff07')}
                  onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : '#ffffff03')}>
                  <td style={{ padding: '10px', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{r.sym}</td>
                  <td style={{ padding: '10px', fontSize: 9,  color: 'var(--text-sec)' }}>{r.company}</td>
                  <td style={{ padding: '10px', fontSize: 11, color: 'var(--text)'}}>{fmtNum(r.dpVolume)}</td>
                  <td style={{ padding: '10px', fontSize: 11, fontWeight: 700, color: r.dpPct > 35 ? '#b388ff' : 'var(--text)' }}>{r.dpPct.toFixed(1)}%</td>
                  <td style={{ padding: '10px', fontSize: 11, fontWeight: 700, color: r.shortFloat > 3 ? '#ff3b3b' : 'var(--text)' }}>{r.shortFloat.toFixed(1)}%</td>
                  <td style={{ padding: '10px', fontSize: 11, fontWeight: 700, color: r.shortChange >= 0 ? '#ff3b3b' : '#00e676' }}>{fmtPct(r.shortChange, 1)}</td>
                  <td style={{ padding: '10px', fontSize: 11, color: r.daysTocover > 3 ? '#ff3b3b' : 'var(--text)' }}>{r.daysTocover.toFixed(1)}d</td>
                  <td style={{ padding: '10px', fontSize: 11, color: r.borrowRate > 1 ? '#ffc107' : 'var(--text)' }}>{r.borrowRate.toFixed(1)}%</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ background: c + '18', border: `1px solid ${c}55`, color: c, fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 2, letterSpacing: 1 }}>{r.sentiment}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { icon: '▦', label: 'Dark Pool >35%', detail: 'Heavy institutional block trading — accumulation signal', color: '#b388ff' },
          { icon: '⚡', label: 'Short Float >3%', detail: 'Elevated short interest — potential squeeze or continued pressure', color: '#ff3b3b' },
          { icon: '★', label: 'Borrow Rate >1%', detail: 'Higher cost to borrow = harder to short = short squeeze risk', color: '#ffc107' },
        ].map(l => (
          <div key={l.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: l.color, marginBottom: 6 }}>{l.icon}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{l.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', lineHeight: 1.6 }}>{l.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
