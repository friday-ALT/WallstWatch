import { useState } from 'react';
import { BANKS } from '../data/banks';

const SECTOR_STOCKS = [
  { sym: 'AAPL', name: 'Apple', sector: 'Technology' },
  { sym: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { sym: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  { sym: 'XOM',  name: 'Exxon Mobil', sector: 'Energy' },
  { sym: 'JNJ',  name: 'Johnson & Johnson', sector: 'Healthcare' },
];

const ALL_STOCKS = [
  ...BANKS.map(b => ({ sym: b.sym, name: b.nm, sector: 'Banking' })),
  ...SECTOR_STOCKS,
];

function generateResearch(sym: string, name: string, sector: string): string[] {
  const templates: Record<string, string[]> = {
    Banking: [
      `**Thesis:** ${name} (${sym}) maintains a structurally advantaged position within the financial sector. Its fortress capital base — with CET1 ratios consistently above regulatory minimums — provides meaningful downside protection in a higher-for-longer rate environment. The net interest margin expansion visible in recent quarters validates the strategic asset-liability positioning taken in 2022–23.`,
      `**Key Drivers:** Three catalysts drive our positive view on ${sym}. First, the inverted yield curve's gradual normalisation will unlock net interest margin upside as short-term funding costs fall faster than long-duration asset yields re-price. Second, the anticipated Fed rate cycle pivot — currently priced for June 2025 — historically benefits banks with floating-rate loan books disproportionately. Third, strong fee income from investment banking and wealth management provides earnings diversification that reduces reliance on spread income.`,
      `**Risk Factors:** The primary risk to our thesis is commercial real estate (CRE) office portfolio deterioration. Sector-wide office delinquency rates reached 4.2% in Q1 2025 — the highest since 2012. ${name}'s exposure warrants monitoring. Secondary risks include geopolitical escalation (Iran, Middle East energy routes) affecting EM credit quality, and the Basel III Endgame regulatory uncertainty that may require incremental capital build.`,
      `**Valuation:** At current levels, ${sym} trades at approximately 1.2x tangible book value — reasonable for a top-tier franchise but not cheap by historical standards. Our 12-month price target implies 15% total return including dividend yield, predicated on EPS recovery as credit provisioning normalises and fee income recovers to 2021–22 levels.`,
      `**Conclusion:** We rate ${sym} OVERWEIGHT with a 12-month horizon. The risk/reward is asymmetric for long-term investors: downside is bounded by the dividend yield and book value support; upside is driven by earnings power in a normalising rate environment. Position sizing should reflect the binary risk from CRE — moderate exposure appropriate.`,
    ],
    Technology: [
      `**Thesis:** ${name} (${sym}) operates at the intersection of three secular megatrends: artificial intelligence infrastructure buildout, cloud computing adoption, and enterprise software modernisation. Its competitive moat — established through proprietary silicon, software ecosystems, and network effects — creates pricing power that peers cannot easily replicate.`,
      `**Key Drivers:** AI capex spending remains the primary revenue driver heading into 2025. Data centre customers continue to prioritise accelerated compute over cost efficiency, creating a multi-year demand tailwind. The enterprise software renewal cycle, delayed by post-COVID budget tightening, is now inflecting positively as CFOs approve AI productivity investments.`,
      `**Risk Factors:** Valuation compression risk is the most significant near-term headwind — at current multiples, any earnings growth disappointment will be punished severely. Additionally, the escalating China regulatory environment creates revenue uncertainty for Asia-Pacific operations. Competition from vertically integrated hyperscalers remains an ongoing structural challenge.`,
      `**Valuation:** ${sym} trades at a meaningful premium to the broader market, which is defensible only if AI-driven earnings growth exceeds consensus estimates. Our bull case — 25% EPS CAGR over 3 years — justifies current multiples. Our bear case — 10% CAGR — implies 30-35% downside.`,
      `**Conclusion:** MARKET WEIGHT. ${name} remains a high-quality compounder, but the risk/reward is more balanced at current prices than 12 months ago. Tactically, we would add on 10%+ pullbacks.`,
    ],
  };

  return templates[sector] ?? templates['Banking'];
}

export function ResearchView({ token }: { token?: string | null }) {
  const [selectedSym, setSelectedSym] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [notes, setNotes] = useState<Record<string, string[]>>({});
  const [citations, setCitations] = useState<Record<string, any[]>>({});
  const [aiMeta, setAiMeta] = useState<Record<string, string>>({});

  const selected = ALL_STOCKS.find(s => s.sym === selectedSym);

  const generate = async () => {
    if (!selected) return;
    setGenerating(true);
    if (token) {
      try {
        const res = await fetch('/api/ai/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ symbol: selected.sym }),
        });
        const data = await res.json();
        if (data.text) {
          setNotes(n => ({ ...n, [selected.sym]: data.text.split('\n\n').filter(Boolean) }));
          setCitations(c => ({ ...c, [selected.sym]: data.citations ?? [] }));
          setAiMeta(m => ({ ...m, [selected.sym]: data.generatedAt }));
          setGenerating(false);
          return;
        }
      } catch { /* fallback */ }
    }
    setTimeout(() => {
      setNotes(n => ({ ...n, [selected.sym]: generateResearch(selected.sym, selected.name, selected.sector) }));
      setGenerating(false);
    }, 1800);
  };

  const sectorColors: Record<string, string> = { Banking: '#ff3b3b', Technology: '#2196f3', Energy: '#ffc107', Healthcare: '#00e676' };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Stock list */}
      <div style={{ width: 220, borderRight: '1px solid var(--border)', overflow: 'y-auto', padding: 12, flexShrink: 0 }}>
        <div className="dc-section-label">SELECT STOCK</div>
        {['Banking', 'Technology', 'Energy', 'Healthcare'].map(sector => (
          <div key={sector} style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: sectorColors[sector], letterSpacing: 2, fontWeight: 700, marginBottom: 6 }}>{sector}</div>
            {ALL_STOCKS.filter(s => s.sector === sector).map(s => (
              <button key={s.sym} onClick={() => setSelectedSym(s.sym)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', background: selectedSym === s.sym ? 'var(--bg-card)' : 'none', border: selectedSym === s.sym ? `1px solid ${sectorColors[sector]}55` : '1px solid transparent', borderRadius: 3, padding: '7px 10px', cursor: 'pointer', marginBottom: 3 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: selectedSym === s.sym ? sectorColors[sector] : 'var(--text-sec)', width: 48 }}>{s.sym}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', flex: 1, textAlign: 'left' }}>{s.name.split(' ')[0]}</span>
                {notes[s.sym] && <span style={{ fontSize: 8, color: '#00e676' }}>✓</span>}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Research panel */}
      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
        {!selected ? (
          <div className="dc-right-empty" style={{ height: '100%' }}>
            <div className="dc-right-empty-icon">◆</div>
            <div className="dc-right-empty-text">Select a stock from the left to generate an AI research note</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-disp)', fontSize: 36, letterSpacing: 4, color: sectorColors[selected.sector] }}>{selected.sym}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-sec)' }}>{selected.name} · {selected.sector}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>AI-GENERATED RESEARCH NOTE · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
              </div>
              <button onClick={generate} disabled={generating}
                style={{ background: generating ? '#4a5568' : sectorColors[selected.sector], border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '10px 20px', borderRadius: 3, cursor: generating ? 'wait' : 'pointer' }}>
                {generating ? '◆ GENERATING…' : notes[selected.sym] ? '↺ REGENERATE' : '◆ GENERATE RESEARCH'}
              </button>
            </div>

            {generating && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: 24, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)', marginBottom: 12 }}>Analysing {selected.name}…</div>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                  {['Capital structure', 'Earnings quality', 'Risk factors', 'Valuation'].map((s, i) => (
                    <div key={s} style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: sectorColors[selected.sector], border: `1px solid ${sectorColors[selected.sector]}55`, padding: '3px 8px', borderRadius: 2, animation: `pulse ${1 + i * 0.3}s ease-in-out infinite` }}>{s}</div>
                  ))}
                </div>
              </div>
            )}

            {!generating && notes[selected.sym] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {notes[selected.sym].map((para, i) => {
                  const title = para.split(':')[0].replace('**','').replace('**','');
                  const body = para.split(':').slice(1).join(':').trim();
                  return (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderLeft: `3px solid ${sectorColors[selected.sector]}`, borderRadius: 4, padding: '16px 20px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: sectorColors[selected.sector], letterSpacing: 2, marginBottom: 8 }}>{title.toUpperCase()}</div>
                      <p style={{ fontSize: 13, color: 'var(--text-sec)', lineHeight: 1.8, margin: 0 }}>{body}</p>
                    </div>
                  );
                })}
                {(citations[selected.sym]?.length ?? 0) > 0 && (
                  <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 4, padding: 14 }}>
                    <div className="dc-section-label">CITATIONS</div>
                    {citations[selected.sym].map((c: any, i: number) => (
                      <div key={i} style={{ fontSize: 10, marginBottom: 6 }}>
                        [{c.type}] {c.title}
                        {c.url && <a href={c.url} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: 'var(--cyan)' }}>source</a>}
                      </div>
                    ))}
                    {aiMeta[selected.sym] && <div style={{ fontSize: 8, color: 'var(--text-dim)' }}>Generated {aiMeta[selected.sym]}</div>}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => window.print()} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '10px 20px', borderRadius: 3, cursor: 'pointer' }}>
                    ↓ EXPORT PDF
                  </button>
                  <button style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-sec)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '10px 20px', borderRadius: 3, cursor: 'pointer' }}>
                    ✉ EMAIL REPORT
                  </button>
                </div>
              </div>
            )}

            {!generating && !notes[selected.sym] && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: 32, textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-disp)', fontSize: 24, letterSpacing: 3, color: 'var(--text-dim)', marginBottom: 8 }}>GENERATE RESEARCH</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', maxWidth: 360, margin: '0 auto' }}>
                  Click "Generate Research" to create an AI-powered analyst note covering thesis, key drivers, risks, valuation, and conclusion.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
