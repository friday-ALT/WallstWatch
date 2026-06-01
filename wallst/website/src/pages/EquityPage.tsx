import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { platform } from '../lib/api';
import { useTerminal } from '../terminal/TerminalProvider';
import { CommandBarV2 } from '../terminal/CommandBarV2';
import { useLiveQuotes } from '../dashboard/hooks/useLiveQuotes';
import { ProGate } from '../dashboard/components/ProGate';
import { useAuth } from '../auth/AuthContext';
import '../styles/dashboard.css';

export function EquityPage() {
  const { symbol: paramSym } = useParams<{ symbol: string }>();
  const sym = (paramSym ?? 'JPM').toUpperCase();
  const navigate = useNavigate();
  const { setSymbol, goDashboard } = useTerminal();
  const { token } = useAuth();
  const quotes = useLiveQuotes([sym]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setSymbol(sym); }, [sym, setSymbol]);

  useEffect(() => {
    setLoading(true);
    platform.equity(sym).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [sym]);

  const q = quotes[sym] ?? data?.quote;
  const up = (q?.dp ?? 0) >= 0;

  const exportPdf = async () => {
    if (!token) return navigate('/login');
    try {
      const { markdown } = await platform.report(token, sym, 'Equity');
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`<pre style="font-family:monospace;padding:40px;white-space:pre-wrap">${markdown.replace(/</g, '&lt;')}</pre>`);
        w.print();
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="dc-root">
      <header className="dc-header">
        <div className="dc-header-left">
          <button type="button" className="dc-back-btn" onClick={() => navigate('/dashboard')}>◆ TERMINAL</button>
          <button type="button" className="dc-back-btn" onClick={() => navigate('/map')}>MAP</button>
          <span className="dc-logo">{sym} US EQUITY</span>
        </div>
        <div className="dc-header-right">
          <CommandBarV2 onTab={t => goDashboard(t)} onMap={() => navigate('/map')} />
          <span className="dc-clock">{data?.delayNote}</span>
        </div>
      </header>

      <div className="dc-equity-body">
        {loading ? <div className="dc-loading">Loading security data…</div> : (
          <>
            <div className="dc-equity-hero">
              <div>
                <h1>{sym}</h1>
                <p>{data?.profile?.name ?? sym}</p>
                <span className="dc-equity-sector">{data?.profile?.finnhubIndustry ?? '—'}</span>
              </div>
              <div className="dc-equity-price" style={{ color: up ? 'var(--green)' : 'var(--red)' }}>
                ${(q?.c ?? 0).toFixed(2)}
                <span>{up ? '+' : ''}{(q?.dp ?? 0).toFixed(2)}%</span>
              </div>
            </div>

            <div className="dc-equity-grid">
              <section className="dc-equity-card">
                <div className="dc-section-label">FUNDAMENTALS</div>
                {[
                  ['Mkt Cap', data?.profile?.marketCapitalization ? `$${(data.profile.marketCapitalization / 1000).toFixed(1)}B` : '—'],
                  ['P/E', data?.metrics?.peBasicExclExtraTTM?.toFixed(1) ?? '—'],
                  ['P/B', data?.metrics?.pbAnnual?.toFixed(2) ?? '—'],
                  ['ROE', data?.metrics?.roeTTM ? `${data.metrics.roeTTM.toFixed(1)}%` : '—'],
                  ['52W H', data?.metrics?.['52WeekHigh']?.toFixed(2) ?? '—'],
                  ['52W L', data?.metrics?.['52WeekLow']?.toFixed(2) ?? '—'],
                ].map(([l, v]) => (
                  <div key={l} className="dc-rate-row"><span>{l}</span><span>{v}</span></div>
                ))}
              </section>

              <section className="dc-equity-card">
                <div className="dc-section-label">LATEST NEWS</div>
                {(data?.news ?? []).slice(0, 6).map((n: any, i: number) => (
                  <a key={i} href={n.url} target="_blank" rel="noreferrer" className="dc-news-item">
                    <span className="dc-news-headline">{n.headline}</span>
                    <span className="dc-news-meta">{n.source}</span>
                  </a>
                ))}
              </section>

              <section className="dc-equity-card">
                <div className="dc-section-label">INSIDER (RECENT)</div>
                <ProGate feature="Insider transactions" requiredPlan="pro">
                  {(data?.insider ?? []).slice(0, 5).map((t: any, i: number) => (
                    <div key={i} className="dc-rate-row">
                      <span>{t.name ?? '—'}</span>
                      <span>{t.transactionCode} {t.share ?? ''}</span>
                    </div>
                  ))}
                </ProGate>
              </section>

              <section className="dc-equity-card">
                <div className="dc-section-label">EARNINGS</div>
                {(data?.earnings ?? []).slice(0, 4).map((e: any, i: number) => (
                  <div key={i} className="dc-rate-row">
                    <span>Q{e.period}</span>
                    <span>{e.actual ?? '—'} vs {e.estimate ?? '—'}</span>
                  </div>
                ))}
              </section>
            </div>

            <div className="dc-equity-actions">
              <button type="button" onClick={() => goDashboard('charts')}>CHART →</button>
              <button type="button" onClick={() => goDashboard('research')}>AI RESEARCH →</button>
              <button type="button" onClick={() => goDashboard('compare')}>COMPARE →</button>
              <button type="button" className="primary" onClick={exportPdf}>GENERATE PDF REPORT</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
