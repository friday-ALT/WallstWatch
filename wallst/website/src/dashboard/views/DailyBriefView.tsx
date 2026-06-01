import { useEffect, useState } from 'react';

const BRIEF_DATE = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

const BRIEF_SECTIONS = [
  {
    tag: '◆ OPENING BELL',
    color: '#ff3b3b',
    time: '06:00 EST',
    title: 'Banking Sector Opens Under Pressure From Rate Uncertainty',
    body: `The Big-6 face a mixed open as Treasury yields continue their drift higher, with the 10Y now at 4.38% and the inverted 2s10s spread holding at -34bps. JPMorgan leads defensively on fortress capital (CET1 15.3%), while Citigroup remains the most geopolitically exposed name heading into a week heavy with Fed speak. Watch the VIX — currently 18.4, elevated versus its 2024 average of 13.2, signalling options markets are pricing more tail risk than spot prices suggest.`,
    tags: ['RATES', 'MACRO'],
  },
  {
    tag: '▲ CAPITAL & CREDIT',
    color: '#00e676',
    time: '07:15 EST',
    title: 'CRE Office Delinquencies Hit 4.2% — WFC and BAC Most Exposed',
    body: `Commercial real estate office delinquencies climbed to 4.2% sector-wide, the highest since 2012. Wells Fargo (CET1: 11.2%) and Bank of America (CET1: 11.9%) carry the thinnest capital buffers and the largest proportional CRE books. JPMorgan flagged Iran geopolitical risk in last week's quarterly call as a "near-term concern" for credit quality in energy-linked commercial portfolios. The Basel III Endgame delay remains a regulatory tailwind that reduces near-term capital pressure across the sector.`,
    tags: ['CRE', 'CREDIT', 'RISK'],
  },
  {
    tag: '◑ EARNINGS WATCH',
    color: '#ffc107',
    time: '08:30 EST',
    title: 'Q1 2025 Reporting Season: What to Watch',
    body: `Goldman Sachs (GS) reports Thursday — consensus EPS $8.56, driven by FICC volatility revenue. GS maintains the most bullish S&P target on the Street at 7,600 but has flagged downside to 5,400 in a severe oil shock scenario. Morgan Stanley (MS) follows Friday with EPS consensus $1.72 — wealth management AUM growth is the key metric. BAC reports on the 15th; BofA's AI "air pocket" thesis continues to define its cautious 7,100 S&P target. Key surprise risk: trading revenues in a VIX-elevated environment.`,
    tags: ['EARNINGS', 'GS', 'MS', 'BAC'],
  },
  {
    tag: '⊕ FED WATCH',
    color: '#b388ff',
    time: '09:00 EST',
    title: 'May FOMC: 72% Probability of Hold — June Cut Still Base Case',
    body: `Markets are pricing a 72% probability of no action at the May 6–7 FOMC meeting following hotter-than-expected CPI (3.2% vs 2.9% estimate) and resilient NFP (+228K). The June 17–18 meeting remains the base case for the first cut, with 55% probability of a 25bps reduction. Fed Governor Waller speaks Thursday — watch for any signal on balance sheet pace. Higher-for-longer directly benefits banks with floating-rate loan books (JPM, WFC) and hurts those with duration-heavy securities portfolios (BAC's $600B AFS book still underwater by ~$100B).`,
    tags: ['FOMC', 'RATES', 'JPM', 'BAC'],
  },
  {
    tag: '◈ INSIDER FLOW',
    color: '#00bcd4',
    time: '09:30 EST',
    title: 'Net Insider Sentiment: BULLISH Across Big-6',
    body: `Aggregate insider activity across JPM, GS, MS, BAC, C, and WFC shows net buying over the trailing 30 days — a historically reliable contrarian signal. JPMorgan insiders have been particularly active buyers. Citigroup shows the most concentrated selling, consistent with the ongoing transformation restructuring and consent order drag. Goldman Sachs insiders went quiet ahead of earnings — standard blackout-period behaviour. Track individual Form 4 filings in the Insider tab for full transaction detail.`,
    tags: ['INSIDER', 'FORM 4', 'SENTIMENT'],
  },
  {
    tag: '▲ GLOBAL MACRO',
    color: '#ff6d00',
    time: '10:00 EST',
    title: 'Dollar Strengthens on Rate Differential; European Banks Under Energy Pressure',
    body: `DXY Index at 104.2, up 1.8% YTD, creating headwinds for HSBC (dual USD/Asia exposure) and BNP Paribas (Euro-denominated revenue). WTI crude at $79.24 on Iran supply disruption concerns — directly relevant to Citi's EM energy credit portfolio and European banks' industrial borrower exposure. Gold at $2,312 reflects safe-haven demand consistent with geopolitical risk pricing. Bitcoin and Ethereum both recovering — crypto risk appetite partially correlated with rate cut expectations.`,
    tags: ['FX', 'MACRO', 'GLOBAL'],
  },
];

export function DailyBriefView({ token }: { token?: string | null }) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [archive, setArchive] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/news').then(r => r.json()).then(d => setNewsItems(d.slice(0, 6))).catch(() => {});
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('/api/platform/brief/archive', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setArchive).catch(() => {});
  }, [token]);

  const saveArchive = async () => {
    if (!token) return;
    const body = BRIEF_SECTIONS.map(s => `## ${s.title}\n${s.body}`).join('\n\n');
    await fetch('/api/platform/brief/archive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: `Brief ${BRIEF_DATE}`, body }),
    });
    const rows = await fetch('/api/platform/brief/archive', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    setArchive(rows);
  };

  const exportPdf = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const html = BRIEF_SECTIONS.map(s => `<h2>${s.title}</h2><p>${s.body}</p>`).join('');
    w.document.write(`<html><body style="font-family:Georgia;padding:40px">${html}</body></html>`);
    w.print();
  };

  return (
    <div className="dc-scroll-area">
      {/* Header */}
      <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderLeft: '3px solid var(--red)', borderRadius: 4, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--red)', letterSpacing: 3, marginBottom: 4 }}>◆ THE WALLST WATCH DAILY BRIEF</div>
          <div style={{ fontSize: 11, color: 'var(--text-sec)' }}>{BRIEF_DATE}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>NEXT EDITION</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>06:00 EST TOMORROW</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="dc-sym-chip" onClick={exportPdf}>PDF EXPORT</button>
            {token && <button type="button" className="dc-sym-chip active" onClick={saveArchive}>SAVE TO ARCHIVE</button>}
          </div>
        </div>
      </div>

      {/* Brief sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {BRIEF_SECTIONS.map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: `1px solid ${expanded === i ? s.color + '66' : 'var(--border)'}`, borderLeft: `3px solid ${s.color}`, borderRadius: 4, overflow: 'hidden', transition: 'border-color .2s' }}>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 14px', textAlign: 'left', display: 'flex', alignItems: 'flex-start', gap: 10 }}
            >
              <div style={{ flexShrink: 0, paddingTop: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 700, color: s.color, letterSpacing: 2, marginBottom: 2 }}>{s.tag}</div>
                <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>{s.time}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', lineHeight: 1.45,
                  display: '-webkit-box', WebkitLineClamp: expanded === i ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {s.title}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'flex-start' }}>
                {s.tags.slice(0,2).map(t => (
                  <span key={t} style={{ fontSize: 7, fontWeight: 700, color: s.color, border: `1px solid ${s.color}55`, background: s.color + '11', padding: '1px 5px', borderRadius: 2, letterSpacing: 1 }}>{t}</span>
                ))}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4, paddingTop: 2 }}>{expanded === i ? '▲' : '▼'}</span>
            </button>
            {expanded === i && (
              <div style={{ padding: '0 14px 14px 14px', borderTop: `1px solid ${s.color}33` }}>
                <p style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.9, margin: '12px 0 0' }}>{s.body}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {archive.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div className="dc-section-label">BRIEF ARCHIVE</div>
          {archive.slice(0, 5).map((a: any) => (
            <div key={a.id} className="dc-rate-row"><span>{a.title}</span><span>{a.created_at?.slice(0, 10)}</span></div>
          ))}
        </div>
      )}

      {/* Live news */}
      <div style={{ marginTop: 20 }}>
        <div className="dc-section-label">LIVE WIRE — BREAKING HEADLINES</div>
        {newsItems.map((item, i) => (
          <a key={i} href={item.url || '#'} target="_blank" rel="noreferrer" className="dc-news-item">
            <span className="dc-news-headline">{item.headline}</span>
            <span className="dc-news-meta">{item.source} · {new Date((item.datetime ?? 0) * 1000).toLocaleTimeString()}</span>
          </a>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div style={{ marginTop: 24, background: 'linear-gradient(135deg, #ff3b3b11, #b388ff11)', border: '1px solid var(--border)', borderRadius: 6, padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--red)', letterSpacing: 3, marginBottom: 8 }}>◆ NEVER MISS A BRIEF</div>
        <div style={{ fontFamily: 'var(--font-disp)', fontSize: 24, letterSpacing: 4, color: 'var(--text)', marginBottom: 8 }}>THE WALLST WATCH</div>
        <div style={{ fontSize: 11, color: 'var(--text-sec)', marginBottom: 16, maxWidth: 400, margin: '0 auto 16px' }}>Daily banking intelligence delivered to your inbox at 6AM EST. Free forever. No spam — just the brief.</div>
        <a href="https://substack.com" target="_blank" rel="noreferrer"
          style={{ display: 'inline-block', background: 'var(--red)', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '12px 28px', borderRadius: 3, textDecoration: 'none' }}>
          SUBSCRIBE FREE ON SUBSTACK →
        </a>
      </div>
    </div>
  );
}
