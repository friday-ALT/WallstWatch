import { AppDownloadSection } from '../components/AppDownloadSection';

const FEATURES = [
  {
    icon: '◆',
    title: 'BANK INTELLIGENCE GRID',
    subtitle: '12-Bank Real-Time Risk Dashboard',
    desc: 'The core of WALLST WATCH. Every major US and European bank mapped on a single screen with live prices updating every 8 seconds via WebSocket. Each card displays CET1 capital ratio, net income, market cap, and a proprietary risk rating calculated from regulatory filings and market data.',
    accent: '#ff3b3b',
    visual: {
      title: 'BANK RISK SCORES — LIVE',
      rows: [
        { label: 'JPM — JPMorgan Chase', val: 'MODERATE', color: '#00e676' },
        { label: 'GS  — Goldman Sachs',  val: 'ELEVATED', color: '#ffc107' },
        { label: 'MS  — Morgan Stanley', val: 'MODERATE', color: '#00e676' },
        { label: 'C   — Citigroup',      val: 'HIGH',     color: '#ff6d00' },
        { label: 'BAC — Bank of America',val: 'ELEVATED', color: '#ffc107' },
        { label: 'DB  — Deutsche Bank',  val: 'HIGH',     color: '#ff6d00' },
      ],
    },
  },
  {
    icon: '◈',
    title: 'INSIDER TRANSACTIONS',
    subtitle: 'C-Suite Buy & Sell Tracker',
    desc: 'Every insider purchase and sale filed with the SEC across all tracked banks — surfaced instantly. See who\'s buying, who\'s selling, at what price, and for what value. Net sentiment calculated automatically: Bullish when purchases dominate, Bearish when executives are unloading.',
    accent: '#b388ff',
    visual: {
      title: 'INSIDER ACTIVITY — JPM',
      rows: [
        { label: 'Jamie Dimon — CEO', val: 'BUY · $2.4M', color: '#00e676' },
        { label: 'Daniel Pinto — COO', val: 'BUY · $580K', color: '#00e676' },
        { label: 'Jeremy Barnum — CFO', val: 'SELL · $1.1M', color: '#ff3b3b' },
        { label: 'Net Sentiment', val: '▲ BULLISH', color: '#00e676' },
      ],
    },
  },
  {
    icon: '⊕',
    title: 'FED WATCH',
    subtitle: 'FOMC Calendar & Rate History',
    desc: 'Track every FOMC meeting scheduled for 2025 with cut probability estimates. Full rate history from the March 2022 liftoff through the current 4.50% target. An embedded US economic calendar highlights upcoming CPI, NFP, PCE, and GDP releases with impact levels.',
    accent: '#ffc107',
    visual: {
      title: 'FOMC OUTLOOK 2025',
      rows: [
        { label: 'Current Rate',       val: '4.50%',  color: '#ffc107' },
        { label: 'Jan 28–29 (HOLD)',   val: '97% prob', color: '#8b95a5' },
        { label: 'Mar 18–19 (HOLD)',   val: '88% prob', color: '#8b95a5' },
        { label: 'Jun 17–18 (CUT?)',   val: '55% prob', color: '#00e676' },
        { label: 'Next Meeting',       val: 'May 6–7',  color: '#ffc107' },
      ],
    },
  },
  {
    icon: '◑',
    title: 'EARNINGS CALENDAR',
    subtitle: '30-Day Forward Earnings View',
    desc: 'EPS estimates vs actuals, revenue beats and misses, and a 30-day forward calendar for every major bank and financial institution. Each row colour-codes to green for beat, red for miss, giving you instant pattern recognition across the sector.',
    accent: '#00e676',
    visual: {
      title: 'UPCOMING EARNINGS',
      rows: [
        { label: 'JPM  Q1 2025', val: 'EPS Est $4.18',  color: '#8b95a5' },
        { label: 'GS   Q1 2025', val: 'EPS Est $8.56',  color: '#8b95a5' },
        { label: 'MS   Q1 2025', val: 'EPS Est $1.72',  color: '#8b95a5' },
        { label: 'BAC  Q1 2025', val: 'EPS Est $0.76',  color: '#8b95a5' },
        { label: 'C    Q1 2025', val: 'EPS Est $1.23',  color: '#8b95a5' },
      ],
    },
  },
  {
    icon: '▲',
    title: 'MACRO DASHBOARD',
    subtitle: 'Key Indicators & Market Pulse',
    desc: 'All macro indicators tracked in a single terminal-style view. Fed Funds Rate, 2Y/10Y yields and the spread, CPI, PCE, DXY Dollar Index, Gold, WTI Crude, VIX, GDP. Live SPY, QQQ, and VIX quotes refresh in real time alongside the latest market-moving news headlines.',
    accent: '#00bcd4',
    visual: {
      title: 'KEY MACRO INDICATORS',
      rows: [
        { label: 'Fed Funds Rate', val: '4.50%',   color: '#ffc107' },
        { label: 'US 10Y Yield',   val: '4.38%',   color: '#ffc107' },
        { label: 'Spread 2s10s',   val: '-34bps',  color: '#ff3b3b' },
        { label: 'CPI (Mar)',      val: '3.2%',    color: '#ffc107' },
        { label: 'VIX',           val: '18.4',    color: '#ffc107' },
        { label: 'WTI Crude',     val: '$79.2',   color: '#ff3b3b' },
      ],
    },
  },
  {
    icon: '⬛',
    title: 'CREDIT SYSTEM HEALTH',
    subtitle: 'Four-Pillar Credit Analysis',
    desc: 'A structural view of US banking credit health across four pillars: Capital Adequacy (CET1 ratios), Liquidity Coverage (LCR), Asset Quality (NPL rates, CRE exposure), and Systemic Risk Score (SRISK, DFAST results, Basel III Endgame status). Updated quarterly from regulatory filings.',
    accent: '#ff6d00',
    visual: {
      title: 'CREDIT HEALTH PILLARS',
      rows: [
        { label: 'Sector Avg CET1',     val: '13.8%',   color: '#00e676' },
        { label: 'Sector LCR',          val: '127%',    color: '#00e676' },
        { label: 'CRE Delinquency',     val: '4.2%',    color: '#ff3b3b' },
        { label: 'SRISK Aggregate',     val: '$1.4T',   color: '#ff3b3b' },
        { label: 'DFAST 2025',          val: 'ALL PASS',color: '#00e676' },
        { label: 'Basel III Endgame',   val: 'DELAYED', color: '#ffc107' },
      ],
    },
  },
];

export function Features() {
  return (
    <>
      <div className="page-hero">
        <div className="section-eyebrow">Intelligence Suite</div>
        <h1>ALL FEATURES</h1>
        <p>Six dedicated views. Institutional-grade data. Designed for your phone.</p>
      </div>

      {FEATURES.map((f) => (
        <div key={f.title} className="feature-full">
          <div className="feature-full-text">
            <div className="section-eyebrow" style={{ color: f.accent }}>{f.icon} {f.subtitle}</div>
            <h2 style={{ color: f.accent }}>{f.title}</h2>
            <p>{f.desc}</p>
            <div className="feature-tags" style={{ marginTop: 0 }}>
              <span className="feature-tag" style={{ color: f.accent, borderColor: f.accent + '55', background: f.accent + '11' }}>
                LIVE DATA
              </span>
              <span className="feature-tag" style={{ color: 'var(--text-sec)', borderColor: 'var(--border)' }}>
                MOBILE + WEB
              </span>
            </div>
          </div>
          <div className="feature-full-visual">
            <div className="feature-full-visual-title">◆ {f.visual.title}</div>
            {f.visual.rows.map((row, i) => (
              <div key={i} className="data-row">
                <span className="data-label">{row.label}</span>
                <span className="data-val" style={{ color: row.color }}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <AppDownloadSection />
    </>
  );
}
