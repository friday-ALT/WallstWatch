import { useState } from 'react';
import { BANKS, riskColor } from '../data/banks';
import { Quote } from '../hooks/useLiveQuotes';

interface Props { quotes: Record<string, Quote>; }

const METRICS = [
  { key: 'price',  label: 'LIVE PRICE',      fmt: (b: any, q: any) => q ? `$${q.c.toFixed(2)}` : `$${b.pr}`, better: 'higher' },
  { key: 'chg',   label: '% CHANGE TODAY',   fmt: (b: any, q: any) => q ? `${q.dp >= 0 ? '+' : ''}${q.dp.toFixed(2)}%` : b.ch, better: 'higher' },
  { key: 'mc',    label: 'MARKET CAP',        fmt: (b: any) => b.mc, better: 'higher' },
  { key: 'c1',    label: 'CET1 RATIO',        fmt: (b: any) => b.c1, better: 'higher' },
  { key: 'ni',    label: 'NET INCOME',        fmt: (b: any) => b.ni, better: 'higher' },
  { key: 'risk',  label: 'RISK LEVEL',        fmt: (b: any) => b.rk, better: 'lower' },
  { key: 'rl',    label: 'RISK SCORE',        fmt: (b: any) => `${b.rl}/10`, better: 'lower' },
];

export function CompareView({ quotes }: Props) {
  const [a, setA] = useState('JPM');
  const [b, setB] = useState('GS');

  const bankA = BANKS.find(x => x.sym === a)!;
  const bankB = BANKS.find(x => x.sym === b)!;
  const qA = quotes[a];
  const qB = quotes[b];

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">PEER COMPARISON — SIDE BY SIDE</div>

      {/* Selector row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div className="dc-section-label">BANK A</div>
          <div className="dc-sym-bar" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: 8, flexWrap: 'wrap', gap: 4 }}>
            {BANKS.map(bk => (
              <button key={bk.sym} className={`dc-sym-chip${a === bk.sym ? ' active' : ''}`} onClick={() => setA(bk.sym)} style={{ padding: '3px 10px' }}>{bk.sym}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="dc-section-label">BANK B</div>
          <div className="dc-sym-bar" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: 8, flexWrap: 'wrap', gap: 4 }}>
            {BANKS.map(bk => (
              <button key={bk.sym} className={`dc-sym-chip${b === bk.sym ? ' active' : ''}`} onClick={() => setB(bk.sym)} style={{ padding: '3px 10px' }}>{bk.sym}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '2px solid var(--border)' }}>
          <div style={{ padding: '14px 16px', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 2 }}>METRIC</div>
          <div style={{ padding: '14px 16px', borderLeft: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-disp)', fontSize: 22, letterSpacing: 3, color: riskColor(bankA.rl) }}>{bankA.sym}</div>
            <div style={{ fontSize: 9, color: 'var(--text-sec)' }}>{bankA.nm}</div>
          </div>
          <div style={{ padding: '14px 16px', borderLeft: '1px solid var(--border)' }}>
            <div style={{ fontFamily: 'var(--font-disp)', fontSize: 22, letterSpacing: 3, color: riskColor(bankB.rl) }}>{bankB.sym}</div>
            <div style={{ fontSize: 9, color: 'var(--text-sec)' }}>{bankB.nm}</div>
          </div>
        </div>

        {METRICS.map((m, i) => {
          const valA = m.fmt(bankA, qA);
          const valB = m.fmt(bankB, qB);
          const numA = parseFloat(valA.replace(/[^0-9.-]/g, ''));
          const numB = parseFloat(valB.replace(/[^0-9.-]/g, ''));
          const aWins = !isNaN(numA) && !isNaN(numB) ? (m.better === 'higher' ? numA > numB : numA < numB) : null;
          const bWins = !isNaN(numA) && !isNaN(numB) ? (m.better === 'higher' ? numB > numA : numB < numA) : null;
          return (
            <div key={m.key} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : '#ffffff04' }}>
              <div style={{ padding: '12px 16px', fontSize: 9, fontWeight: 700, color: 'var(--text-sec)', letterSpacing: 1, display: 'flex', alignItems: 'center' }}>{m.label}</div>
              <div style={{ padding: '12px 16px', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: aWins === true ? '#00e676' : aWins === false ? '#ff3b3b' : 'var(--text)' }}>{valA}</span>
                {aWins === true && <span style={{ fontSize: 10, color: '#00e676' }}>▲ BETTER</span>}
              </div>
              <div style={{ padding: '12px 16px', borderLeft: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: bWins === true ? '#00e676' : bWins === false ? '#ff3b3b' : 'var(--text)' }}>{valB}</span>
                {bWins === true && <span style={{ fontSize: 10, color: '#00e676' }}>▲ BETTER</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Signal comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        {[bankA, bankB].map(bk => (
          <div key={bk.sym} style={{ background: 'var(--bg-card)', border: `1px solid ${riskColor(bk.rl)}44`, borderRadius: 4, padding: 14 }}>
            <div style={{ fontFamily: 'var(--font-disp)', fontSize: 18, letterSpacing: 3, color: riskColor(bk.rl), marginBottom: 10 }}>{bk.sym} SIGNALS</div>
            {bk.sg.map((sg, i) => (
              <div key={i} className="dc-signal" style={{ borderLeftColor: sg.y === 'ok' ? '#00e676' : sg.y === 'warn' ? '#ff3b3b' : '#ffc107' }}>{sg.t}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
