import { useEffect, useState } from 'react';
import { Skeleton } from '../components/Skeleton';
import { fmtPct } from '../utils/fmt';

const BREADTH_DATA = {
  advDecLine: { advances: 287, declines: 213, unchanged: 12 },
  newHighsLows: { highs52w: 143, lows52w: 38 },
  aboveMA: { above200d: 62.4, above50d: 54.1, above20d: 48.7 },
  sectors: [
    { name: 'Financials',   chg: +1.24, adv: 42, dec: 18, color: '#ff3b3b' },
    { name: 'Technology',   chg: +0.88, adv: 68, dec: 32, color: '#2196f3' },
    { name: 'Energy',       chg: -0.61, adv: 12, dec: 28, color: '#ffc107' },
    { name: 'Healthcare',   chg: +0.34, adv: 35, dec: 21, color: '#00e676' },
    { name: 'Industrials',  chg: +0.12, adv: 28, dec: 24, color: '#b388ff' },
    { name: 'Consumer Disc',chg: -0.44, adv: 22, dec: 31, color: '#00bcd4' },
    { name: 'Utilities',    chg: -0.91, adv: 8,  dec: 20, color: '#ff6d00' },
    { name: 'Real Estate',  chg: -1.23, adv: 5,  dec: 26, color: '#ff3b3b' },
    { name: 'Materials',    chg: +0.56, adv: 18, dec: 11, color: '#00e676' },
    { name: 'Comm Services',chg: +1.02, adv: 24, dec: 14, color: '#2196f3' },
    { name: 'Cons Staples', chg: -0.18, adv: 16, dec: 18, color: '#ffc107' },
  ],
  indicators: [
    { label: 'NYSE A/D Line',     val: '+74',  status: 'POSITIVE', color: '#00e676', note: 'More advancing than declining' },
    { label: 'McClellan Osc.',    val: '+28.4',status: 'POSITIVE', color: '#00e676', note: 'Breadth expanding' },
    { label: 'ARMS Index (TRIN)', val: '0.84', status: 'BULLISH',  color: '#00e676', note: '<1.0 = buying pressure' },
    { label: 'Put/Call Ratio',    val: '0.72', status: 'NEUTRAL',  color: '#ffc107', note: 'Slightly elevated calls' },
    { label: 'VIX Term',          val: 'CONTANGO', status: 'CALM', color: '#00e676', note: 'Normal futures structure' },
    { label: 'Fear & Greed',      val: '52',   status: 'NEUTRAL',  color: '#ffc107', note: 'Greed territory threshold' },
    { label: 'High-Low Index',    val: '68%',  status: 'POSITIVE', color: '#00e676', note: '68% stocks near 52W high' },
    { label: 'Bullish %',         val: '58.4%',status: 'POSITIVE', color: '#00e676', note: 'Bull market threshold >50%' },
  ],
};

export function BreadthView() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 600); }, []);

  const { advDecLine: adl, newHighsLows: nhl, aboveMA, sectors, indicators } = BREADTH_DATA;
  const total = adl.advances + adl.declines + adl.unchanged;
  const advPct = (adl.advances / total * 100);

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">MARKET BREADTH — INTERNAL HEALTH INDICATORS</div>

      {!loaded ? <Skeleton rows={6} height={40} gap={8} /> : (
        <>
          {/* Top stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { l: 'ADVANCING',  v: adl.advances.toString(), c: '#00e676', sub: `${advPct.toFixed(0)}% of NYSE` },
              { l: 'DECLINING',  v: adl.declines.toString(), c: '#ff3b3b', sub: `${(adl.declines/total*100).toFixed(0)}% of NYSE` },
              { l: '52W HIGHS',  v: nhl.highs52w.toString(), c: '#00e676', sub: 'new highs today' },
              { l: '52W LOWS',   v: nhl.lows52w.toString(),  c: '#ff3b3b', sub: 'new lows today' },
            ].map(s => (
              <div key={s.l} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: `2px solid ${s.c}`, borderRadius: 4, padding: '14px 16px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 6 }}>{s.l}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: s.c, lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="dc-three-col">
            {/* Breadth indicators */}
            <div style={{ gridColumn: 'span 1' }}>
              <div className="dc-section-label">BREADTH INDICATORS</div>
              {indicators.map((ind, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: ind.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{ind.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)' }}>{ind.note}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: ind.color }}>{ind.val}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: ind.color, border: `1px solid ${ind.color}44`, padding: '1px 4px', borderRadius: 2, marginTop: 2 }}>{ind.status}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* % Above MAs */}
            <div>
              <div className="dc-section-label">% STOCKS ABOVE MOVING AVERAGES</div>
              {[
                { label: '200-Day MA', val: aboveMA.above200d, note: 'Long-term trend', threshold: 50 },
                { label: '50-Day MA',  val: aboveMA.above50d,  note: 'Medium-term',    threshold: 50 },
                { label: '20-Day MA',  val: aboveMA.above20d,  note: 'Short-term',     threshold: 50 },
              ].map((m, i) => (
                <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text)' }}>{m.label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)' }}>{m.note}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 700, color: m.val >= m.threshold ? '#00e676' : '#ff3b3b' }}>{m.val}%</div>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${m.val}%`, background: m.val >= m.threshold ? '#00e676' : '#ff3b3b', borderRadius: 3, transition: 'width 1s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)' }}>0%</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)' }}>50% threshold</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)' }}>100%</span>
                  </div>
                </div>
              ))}

              {/* A/D ratio bar */}
              <div className="dc-section-label" style={{ marginTop: 16 }}>ADVANCE / DECLINE RATIO</div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: 14 }}>
                <div style={{ display: 'flex', height: 24, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                  <div style={{ width: `${advPct}%`, background: '#00e676', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#000' }}>{adl.advances} ▲</span>
                  </div>
                  <div style={{ flex: 1, background: '#ff3b3b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: '#fff' }}>▼ {adl.declines}</span>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', textAlign: 'center' }}>
                  {advPct.toFixed(0)}% advancing — market breadth is <span style={{ color: advPct >= 50 ? '#00e676' : '#ff3b3b', fontWeight: 700 }}>{advPct >= 55 ? 'STRONG' : advPct >= 45 ? 'NEUTRAL' : 'WEAK'}</span>
                </div>
              </div>
            </div>

            {/* Sector heatmap */}
            <div>
              <div className="dc-section-label">SECTOR PERFORMANCE HEATMAP</div>
              {sectors.sort((a, b) => b.chg - a.chg).map((s, i) => {
                const bg = s.chg >= 0 ? `rgba(0,230,118,${Math.min(s.chg * 0.3, 0.25)})` : `rgba(255,59,59,${Math.min(Math.abs(s.chg) * 0.3, 0.25)})`;
                const border = s.chg >= 0 ? '#00e67644' : '#ff3b3b44';
                return (
                  <div key={i} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 3, padding: '8px 12px', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text)', flex: 1 }}>{s.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{s.adv}↑ {s.dec}↓</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: s.chg >= 0 ? '#00e676' : '#ff3b3b', width: 60, textAlign: 'right' }}>{fmtPct(s.chg, 2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
