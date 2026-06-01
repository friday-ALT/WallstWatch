const TECH = [
  'React Native', 'Expo Go', 'TypeScript', 'Express.js', 'WebSockets',
  'Finnhub API', 'Expo Router', 'JetBrains Mono', 'Bebas Neue', 'React Navigation',
  'Node.js', 'Vite', 'React Router v6', 'SEC EDGAR', 'FRED API',
];

const PRINCIPLES = [
  {
    icon: '◆',
    title: 'Terminal-First Design',
    desc: 'Every screen is designed like a Bloomberg terminal — dense, fast, and immediately legible. No charts for the sake of charts. Only data that changes decisions.',
    color: '#ff3b3b',
  },
  {
    icon: '▲',
    title: 'Real-Time, Always',
    desc: 'WebSocket connections push price updates every 8 seconds. Insider transactions index daily. Fed calendar refreshes on schedule. Stale data is not an option.',
    color: '#00e676',
  },
  {
    icon: '⊕',
    title: 'Institutional Quality',
    desc: 'CET1 ratios, SRISK scores, DFAST results, Basel III Endgame tracking — the metrics professional analysts actually use, not watered-down retail summaries.',
    color: '#ffc107',
  },
];

export function About() {
  return (
    <div className="about-content">
      <div className="section-eyebrow" style={{ marginBottom: 12 }}>About</div>

      <div className="mission-quote">
        <p>"The Bloomberg Terminal costs $24,000 a year. WALLST WATCH puts the same intelligence on your phone — for free."</p>
      </div>

      <h2>WHAT IS WALLST WATCH?</h2>
      <p>
        WALLST WATCH is a real-time banking intelligence command center built as a mobile-first application using React Native and Expo. It aggregates live market data, regulatory filings, insider transactions, Fed policy signals, and macro indicators into six dedicated intelligence views.
      </p>
      <p>
        The app is built for serious investors, analysts, and finance professionals who need to monitor the global banking sector without being chained to a desktop terminal. Whether you're tracking a potential CRE credit event, monitoring insider sentiment before earnings, or watching for FOMC signals — WALLST WATCH has it.
      </p>

      <h2>DESIGN PRINCIPLES</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
        {PRINCIPLES.map((p) => (
          <div key={p.title} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderLeft: `3px solid ${p.color}`, borderRadius: 4, padding: '20px 24px',
            display: 'flex', gap: 20, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 20, color: p.color, flexShrink: 0 }}>{p.icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: p.color, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{p.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>TECH STACK</h2>
      <p>Built with a modern, type-safe stack. The mobile app connects to a lightweight Express proxy server that manages API keys and WebSocket broadcasts. Everything runs locally — your data never passes through a third-party server.</p>
      <div className="tech-grid">
        {TECH.map((t) => <span key={t} className="tech-chip">{t}</span>)}
      </div>

      <h2>DATA SOURCES</h2>
      <p>
        Market quotes and news are sourced from <strong style={{ color: 'var(--text)' }}>Finnhub</strong>. Insider transactions come from <strong style={{ color: 'var(--text)' }}>SEC EDGAR Form 4 filings</strong>. Macro indicators reference Federal Reserve H.15 releases. Earnings data from Finnhub's earnings calendar endpoint. All data is consumed in real time with no caching layer that would introduce staleness.
      </p>

      <h2>DISCLAIMER</h2>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', border: '1px solid var(--border)', padding: '16px 20px', borderRadius: 4, lineHeight: 1.8 }}>
        WALLST WATCH is for informational and educational purposes only. Nothing displayed constitutes financial, investment, or legal advice. Always conduct your own research and consult a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.
      </p>
    </div>
  );
}
