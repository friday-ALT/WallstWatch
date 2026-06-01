import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RISKS = [
  { sym: 'C',   name: 'Citigroup',       level: 7, label: 'HIGH',     color: '#ff6d00' },
  { sym: 'DB',  name: 'Deutsche Bank',   level: 7, label: 'HIGH',     color: '#ff6d00' },
  { sym: 'BNP', name: 'BNP Paribas',    level: 6, label: 'HIGH',     color: '#ff6d00' },
  { sym: 'WFC', name: 'Wells Fargo',    level: 6, label: 'ELEVATED',  color: '#ffc107' },
  { sym: 'BAC', name: 'Bank of America',level: 5, label: 'ELEVATED',  color: '#ffc107' },
  { sym: 'GS',  name: 'Goldman Sachs',  level: 5, label: 'ELEVATED',  color: '#ffc107' },
  { sym: 'MS',  name: 'Morgan Stanley', level: 4, label: 'MODERATE',  color: '#00e676' },
  { sym: 'JPM', name: 'JPMorgan Chase', level: 3, label: 'MODERATE',  color: '#00e676' },
];

const INTEL_FEED = [
  { time: '09:42', type: 'INSIDER', badge: '#b388ff', text: 'JPM — Jamie Dimon sold 131,500 shares @ $283.40 · $37.2M' },
  { time: '09:31', type: 'EARNINGS', badge: '#00e676', text: 'GS Q2 EPS $11.74 vs $10.18 est. — BEAT +15.3%' },
  { time: '09:15', type: 'FOMC', badge: '#ff3b3b', text: 'Fed holds rates at 5.25–5.50% · Next decision Jun 11' },
  { time: '08:58', type: 'CREDIT', badge: '#ffc107', text: 'C CET1 ratio fell to 13.1% — watch threshold at 12.5%' },
  { time: '08:44', type: 'MACRO', badge: '#00bcd4', text: 'VIX spikes to 18.4 · 10Y yield 4.38% · DXY 105.2' },
  { time: '08:30', type: 'AI', badge: '#ff6d00', text: 'AI Research: BAC loan loss reserves up 8% YoY — elevated consumer risk' },
  { time: '08:12', type: 'INSIDER', badge: '#b388ff', text: 'MS — Ted Pick purchased 22,000 shares @ $118.20 · $2.6M' },
  { time: '07:55', type: 'EARNINGS', badge: '#00e676', text: 'WFC Q2 revenue $20.7B — MISS vs $21.1B est.' },
];

const MACRO_DATA = [
  { label: 'FED FUNDS',  val: '5.25–5.50%', chg: 'HOLD',    color: '#ffc107' },
  { label: '10Y YIELD',  val: '4.38%',       chg: '+0.04',   color: '#ff3b3b' },
  { label: '2Y YIELD',   val: '4.72%',       chg: '+0.02',   color: '#ff3b3b' },
  { label: 'CPI YoY',    val: '3.4%',        chg: '▼ -0.1', color: '#00e676' },
  { label: 'PCE YoY',    val: '2.7%',        chg: '▼ -0.1', color: '#00e676' },
  { label: 'VIX',        val: '18.40',       chg: '-2.14%',  color: '#00e676' },
  { label: 'DXY',        val: '105.18',      chg: '-0.11%',  color: '#00e676' },
  { label: 'WTI CRUDE',  val: '$79.34',      chg: '+1.20%',  color: '#ff3b3b' },
];

const PILLARS = [
  {
    id: 'BANKING',
    color: '#ff3b3b',
    title: 'BANKING DATA',
    subtitle: '12 major institutions · live capital ratios · proprietary risk scoring',
    rows: [
      { sym: 'JPM', price: '$283.15', chg: '+1.11%', up: true,  cet1: '15.3%', rk: 'MODERATE', rkColor: '#00e676' },
      { sym: 'GS',  price: '$562.40', chg: '-0.86%', up: false, cet1: '14.7%', rk: 'ELEVATED', rkColor: '#ffc107' },
      { sym: 'C',   price: '$71.85',  chg: '-0.44%', up: false, cet1: '13.1%', rk: 'HIGH',     rkColor: '#ff6d00' },
      { sym: 'BAC', price: '$42.67',  chg: '+1.26%', up: true,  cet1: '13.8%', rk: 'ELEVATED', rkColor: '#ffc107' },
      { sym: 'WFC', price: '$72.14',  chg: '+1.23%', up: true,  cet1: '13.5%', rk: 'ELEVATED', rkColor: '#ffc107' },
    ],
  },
  {
    id: 'MACRO',
    color: '#00bcd4',
    title: 'MACRO INTEL',
    subtitle: 'Fed policy · yield curve · CPI · DXY · commodities',
    rows: MACRO_DATA,
  },
  {
    id: 'AI',
    color: '#b388ff',
    title: 'AI RESEARCH',
    subtitle: 'Claude-powered analysis · on-demand notes · SEC filing alerts',
    notes: [
      { bank: 'JPM', note: 'Fortress balance sheet intact. Net interest income guidance raised 5% — bullish signal for Q3.', sentiment: 'BULLISH', color: '#00e676' },
      { bank: 'C',   note: 'CET1 compression toward regulatory floor. Watch $12.5% threshold — downgrade risk elevated.', sentiment: 'BEARISH', color: '#ff3b3b' },
      { bank: 'GS',  note: 'Trading revenue beat driven by FICC. M&A pipeline recovery supports sustained outperformance.', sentiment: 'BULLISH', color: '#00e676' },
      { bank: 'BAC', note: 'Consumer loan delinquencies trending up 12bps QoQ. Provisioning likely to increase in H2.', sentiment: 'CAUTION', color: '#ffc107' },
    ],
  },
];

export function Landing() {
  const navigate = useNavigate();
  const [clock, setClock] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);
  const [activePillar, setActivePillar] = useState('BANKING');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getUTCHours(), m = now.getUTCMinutes(), s = now.getUTCSeconds();
      setClock(
        String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0') + ' UTC'
      );
      setMarketOpen(h * 60 + m >= 870 && h * 60 + m < 1260);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const pillar = PILLARS.find(p => p.id === activePillar)!;

  return (
    <>
      {/* ── 1. HERO ── */}
      <section className="hero">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 28, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: marketOpen ? '#00e676' : '#ffc107', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: marketOpen ? '#00e676' : '#ffc107', letterSpacing: 2 }}>
              {marketOpen ? 'MARKET OPEN' : 'MARKET CLOSED'}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>{clock}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-sec)', letterSpacing: 1 }}>BANKING INTELLIGENCE TERMINAL</span>
        </div>

        <h1 className="hero-title">WALLST<br /><span>WATCH</span></h1>
        <p className="hero-subtitle">Banking Command Center</p>
        <p className="hero-desc">
          Institutional-grade banking intelligence. 12 major banks, insider transactions, Fed policy, AI research — one terminal. Bloomberg charges $2,000/month. Pro from £2.99/month.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={() => navigate('/map')}>▶ Open Market Map</button>
          <button className="btn-outline" onClick={() => navigate('/pricing')}>View Pricing →</button>
        </div>
        <div className="hero-stats">
          {[
            { num: '12',    label: 'Banks Tracked' },
            { num: '$4.2T', label: 'Assets Monitored' },
            { num: '20+',   label: 'Intelligence Views' },
            { num: '8s',    label: 'Data Refresh Rate' },
          ].map((s) => (
            <div key={s.label}>
              <div className="hero-stat-num">{s.num}</div>
              <div className="hero-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. TERMINAL PREVIEW (full-width, the "wow" moment) ── */}
      <section style={{ background: 'var(--bg-panel)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        {/* Terminal chrome bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 24px', borderBottom: '1px solid var(--border)',
          background: '#080a0d',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 2 }}>WALLST WATCH — COMMAND CENTER v2.0</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00e676', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#00e676', fontWeight: 700 }}>LIVE</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{clock}</span>
          </div>
        </div>

        {/* Three-column terminal layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 280px', minHeight: 440 }}>

          {/* Col 1: Intel Feed */}
          <div style={{ borderRight: '1px solid var(--border)' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--red)', animation: 'pulse 2s ease-in-out infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text)', letterSpacing: 2 }}>INTEL FEED</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)' }}>TODAY</span>
            </div>
            {INTEL_FEED.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 16px',
                borderBottom: '1px solid var(--border)',
                background: i === 0 ? 'var(--red)08' : 'transparent',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', flexShrink: 0, width: 34, paddingTop: 1 }}>{item.time}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 700,
                  color: item.badge === '#ff3b3b' ? '#fff' : item.badge,
                  background: item.badge === '#ff3b3b' ? item.badge : item.badge + '22',
                  border: `1px solid ${item.badge}44`,
                  padding: '2px 5px', borderRadius: 2, flexShrink: 0, letterSpacing: 0.5, whiteSpace: 'nowrap',
                }}>{item.type}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)', lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Col 2: Bank grid */}
          <div style={{ borderRight: '1px solid var(--border)' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text)', letterSpacing: 2 }}>BANK MAP</span>
            </div>
            {/* Column headers */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 70px 60px 90px', padding: '6px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              {['SYM', 'PRICE', 'CHG', 'CET1', 'RISK'].map(h => (
                <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1 }}>{h}</span>
              ))}
            </div>
            {[
              { sym: 'JPM', price: '$283.15', chg: '+1.11%', up: true,  cet1: '15.3%', rk: 'MODERATE', rkColor: '#00e676' },
              { sym: 'GS',  price: '$562.40', chg: '-0.86%', up: false, cet1: '14.7%', rk: 'ELEVATED', rkColor: '#ffc107' },
              { sym: 'MS',  price: '$118.23', chg: '+1.24%', up: true,  cet1: '15.1%', rk: 'MODERATE', rkColor: '#00e676' },
              { sym: 'BAC', price: '$42.67',  chg: '+1.26%', up: true,  cet1: '13.8%', rk: 'ELEVATED', rkColor: '#ffc107' },
              { sym: 'C',   price: '$71.85',  chg: '-0.44%', up: false, cet1: '13.1%', rk: 'HIGH',     rkColor: '#ff6d00' },
              { sym: 'WFC', price: '$72.14',  chg: '+1.23%', up: true,  cet1: '13.5%', rk: 'ELEVATED', rkColor: '#ffc107' },
              { sym: 'DB',  price: '$18.42',  chg: '-1.34%', up: false, cet1: '13.9%', rk: 'HIGH',     rkColor: '#ff6d00' },
              { sym: 'UBS', price: '$32.56',  chg: '+0.67%', up: true,  cet1: '14.2%', rk: 'MODERATE', rkColor: '#00e676' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 70px 60px 90px',
                padding: '9px 16px',
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'transparent' : 'var(--bg-card)44',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{r.sym}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)' }}>{r.price}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: r.up ? '#00e676' : '#ff3b3b' }}>{r.chg}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)' }}>{r.cet1}</span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                  color: r.rkColor, background: r.rkColor + '18',
                  border: `1px solid ${r.rkColor}44`,
                  padding: '2px 6px', borderRadius: 2,
                }}>{r.rk}</span>
              </div>
            ))}
          </div>

          {/* Col 3: Risk sidebar */}
          <div>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--text)', letterSpacing: 2 }}>TOP RISKS</span>
            </div>
            {RISKS.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{r.sym}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', marginTop: 1 }}>{r.name}</div>
                </div>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 700,
                  color: r.color, border: `1px solid ${r.color}55`,
                  background: r.color + '18', padding: '3px 7px', borderRadius: 2, letterSpacing: 0.5,
                }}>{r.label}</span>
              </div>
            ))}
            <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
              <button
                onClick={() => navigate('/dashboard')}
                style={{
                  width: '100%', padding: '9px', background: 'var(--red)',
                  color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 1,
                }}
              >
                OPEN COMMAND CENTER →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3. WHAT YOU GET — 3 pillars ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-eyebrow">What You Get</div>
          <h2 className="section-title">THREE PILLARS OF INTELLIGENCE</h2>
          <p className="section-desc">Every data set that matters. No fluff, no noise — just the numbers institutional investors actually use.</p>
        </div>

        {/* Pillar tab switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
          {PILLARS.map(p => (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.id)}
              style={{
                background: activePillar === p.id ? 'var(--bg-card)' : 'transparent',
                borderTop: activePillar === p.id ? `2px solid ${p.color}` : '2px solid transparent',
                borderLeft: 'none', borderRight: 'none',
                borderBottom: activePillar === p.id ? '1px solid var(--bg-card)' : '1px solid transparent',
                color: activePillar === p.id ? p.color : 'var(--text-dim)',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 2,
                padding: '12px 32px', cursor: 'pointer', transition: 'all .15s',
                marginBottom: -1,
              }}
            >
              {p.id}
            </button>
          ))}
        </div>

        {/* Pillar content panel */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderTop: 'none', borderRadius: '0 0 4px 4px',
        }}>
          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-disp)', fontSize: 22, letterSpacing: 3, color: pillar.color }}>{pillar.title}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 4, letterSpacing: 1 }}>{pillar.subtitle}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: pillar.color, animation: 'pulse 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: pillar.color, fontWeight: 700 }}>LIVE DATA</span>
            </div>
          </div>

          {/* BANKING pillar */}
          {activePillar === 'BANKING' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 70px 70px 100px', padding: '8px 24px', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
                {['SYMBOL', 'INSTITUTION', 'PRICE', 'CHG', 'CET1', 'RISK LEVEL'].map(h => (
                  <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1 }}>{h}</span>
                ))}
              </div>
              {(pillar as typeof PILLARS[0]).rows!.map((r: any, i: number) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '80px 1fr 80px 70px 70px 100px',
                  padding: '12px 24px', borderBottom: '1px solid var(--border)',
                  transition: 'background .15s',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{r.sym}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)' }}>{r.name || ''}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }}>{r.price}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: r.up ? '#00e676' : '#ff3b3b' }}>{r.chg}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)' }}>{r.cet1}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                    color: r.rkColor, background: r.rkColor + '18',
                    border: `1px solid ${r.rkColor}44`, padding: '3px 8px', borderRadius: 2, display: 'inline-block',
                  }}>{r.rk}</span>
                </div>
              ))}
              <div style={{ padding: '14px 24px', display: 'flex', gap: 20 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>+ 7 more banks tracked in full dashboard</span>
                <button onClick={() => navigate('/dashboard')} style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>VIEW ALL →</button>
              </div>
            </div>
          )}

          {/* MACRO pillar */}
          {activePillar === 'MACRO' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {MACRO_DATA.map((m, i) => (
                <div key={i} style={{
                  padding: '24px', borderRight: i % 4 !== 3 ? '1px solid var(--border)' : 'none',
                  borderBottom: i < 4 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 10 }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--font-disp)', fontSize: 28, letterSpacing: 2, color: 'var(--text)', lineHeight: 1, marginBottom: 8 }}>{m.val}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: m.color }}>{m.chg}</div>
                </div>
              ))}
            </div>
          )}

          {/* AI pillar */}
          {activePillar === 'AI' && (
            <div>
              {(pillar as typeof PILLARS[2]).notes!.map((n: any, i: number) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr 100px',
                  padding: '18px 24px', borderBottom: '1px solid var(--border)',
                  gap: 20, alignItems: 'start',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{n.bank}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', marginTop: 2 }}>AI NOTE</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-sec)', lineHeight: 1.7 }}>{n.note}</div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
                      color: n.color, background: n.color + '18',
                      border: `1px solid ${n.color}44`, padding: '4px 10px', borderRadius: 2,
                    }}>{n.sentiment}</span>
                  </div>
                </div>
              ))}
              <div style={{ padding: '14px 24px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>AI Research available on Professional plan · Powered by Claude</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. PRICING TEASER ── */}
      <section style={{ background: 'var(--bg-panel)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '60px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-eyebrow">Pricing</div>
            <h2 className="section-title">START FREE. SCALE WHEN READY.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {[
              { name: 'FREE',         price: '$0',   sub: 'forever',   color: '#4a5568', features: ['6 banks', 'Delayed quotes', 'Daily brief'], highlight: false },
              { name: 'PRO',          price: '£2.99',  sub: 'per month', color: '#ff3b3b', features: ['All 12 banks', 'Live WebSocket', 'Insider data', 'Fed Watch', 'Charts'], highlight: true },
              { name: 'PROFESSIONAL', price: '£7.99',  sub: 'per month', color: '#b388ff', features: ['Everything in Pro', 'AI research', 'Options flow', 'Dark pool', 'PDF export'], highlight: false },
              { name: 'INSTITUTIONAL',price: 'Custom', sub: 'tailored', color: '#ffc107', features: ['Teams seats', 'API access', 'Webhooks', 'SLA guarantee'], highlight: false },
            ].map((p) => (
              <div key={p.name} style={{
                background: p.highlight ? 'var(--red)0d' : 'var(--bg-card)',
                padding: '28px 24px',
                borderTop: `2px solid ${p.highlight ? p.color : 'var(--border)'}`,
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: p.color, letterSpacing: 2, marginBottom: 12 }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-disp)', fontSize: 36, letterSpacing: 2, color: 'var(--text)', lineHeight: 1 }}>{p.price}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginBottom: 20, marginTop: 4 }}>{p.sub}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                  {p.features.map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: p.color }}>✓</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)' }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/pricing')}
                  style={{
                    width: '100%', padding: '9px',
                    background: p.highlight ? p.color : 'transparent',
                    color: p.highlight ? '#fff' : p.color,
                    border: `1px solid ${p.color}`,
                    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
                    letterSpacing: 1, borderRadius: 3, cursor: 'pointer',
                  }}
                >
                  {p.name === 'FREE' ? 'GET STARTED' : 'SEE PLAN →'}
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => navigate('/pricing')} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: 1 }}>
              Compare all features in detail →
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. CTA ── */}
      <section className="cta-section">
        <h2>START WATCHING<br />THE MARKET</h2>
        <p>Institutional-grade banking intelligence. Free to start, no credit card required.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
          <button className="btn-primary" style={{ fontSize: 13, padding: '14px 36px' }} onClick={() => navigate('/signup')}>
            Create Free Account
          </button>
          <button className="btn-outline" style={{ fontSize: 13, padding: '14px 36px' }} onClick={() => navigate('/dashboard')}>
            Preview Dashboard →
          </button>
        </div>
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { val: 'Free forever',  label: 'Base tier' },
            { val: 'No card',       label: 'To start' },
            { val: 'Cancel anytime',label: 'No lock-in' },
            { val: '98% cheaper',   label: 'vs Bloomberg' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: 1 }}>{s.val}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 3, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
