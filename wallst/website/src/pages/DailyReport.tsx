import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapTickerBar } from '../map/components/MapTickerBar';
import { MapHeader } from '../map/components/MapHeader';
import { TICKER_SYMBOLS } from '../dashboard/data/banks';
import { useLiveQuotes } from '../dashboard/hooks/useLiveQuotes';
import { useAuth } from '../auth/AuthContext';
import { hasPlanAccess } from '../config/features';
import '../styles/map.css';

const DATE = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function DailyReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const quotes = useLiveQuotes(TICKER_SYMBOLS);
  const [utc, setUtc] = useState('');
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const trialActive = (user as { trialActive?: boolean } | null)?.trialActive ?? false;
  const isPro = hasPlanAccess(user?.plan, 'pro', trialActive);

  useEffect(() => {
    const tick = () => setUtc(new Date().toUTCString().split(' ')[4] ?? '');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then((items: { headline: string }[]) => {
        if (!Array.isArray(items) || items.length === 0) {
          setBrief(null);
          return;
        }
        const headlines = items.slice(0, 5).map(n => `• ${n.headline}`).join('\n');
        setBrief(
          `Markets are digesting the latest flow in financials and macro. Key headlines today:\n\n${headlines}\n\nBanking Radar: G-SIB names remain in focus ahead of earnings. Watch CET1 buffers and NII guidance from JPM, GS, and BAC. Macro desk flags the 2s10s curve and VIX as primary risk gauges.`
        );
      })
      .catch(() => setBrief(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mm-root" style={{ height: 'auto', minHeight: '100vh' }}>
      <MapTickerBar quotes={quotes} />
      <MapHeader utc={utc} bankCount={12} />

      <div className="mm-report-page">
        <div className="mm-report-hero">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: 3, marginBottom: 12 }}>
            ◆ MARKET DAILY REPORT — {DATE.toUpperCase()}
          </div>
          <h1 style={{ fontFamily: 'var(--font-disp)', fontSize: 'clamp(36px, 5vw, 56px)', letterSpacing: 4, lineHeight: 1.1, marginBottom: 16 }}>
            MARKET DAILY REPORT
          </h1>
          <p style={{ color: 'var(--text-sec)', fontSize: 15, lineHeight: 1.8, maxWidth: 560 }}>
            AI-generated morning briefing covering global markets, banking sector radar, and macro threat assessment — delivered to your inbox on Pro.
          </p>
        </div>

        <div className="mm-report-section">
          <h2>EXECUTIVE SUMMARY</h2>
          {loading ? (
            <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>LOADING INTEL...</p>
          ) : (
            <p>{brief ?? 'Financials are leading sector performance as investors position for bank earnings. Fed policy remains on hold with focus on labor and inflation prints.'}</p>
          )}
        </div>

        <div className="mm-report-section">
          <h2>BANKING RADAR</h2>
          <p>
            US G-SIBs: mixed session with JPM and BAC showing relative strength vs European peers (DB, BNP). Credit spreads in HY remain a watch item for regional banks. CET1 buffers adequate at JPM/MS; Citi transformation drag continues.
          </p>
        </div>

        <div className="mm-report-section">
          <h2>MACRO & RATES</h2>
          <p>
            Fed funds at 4.50%. 10Y near 4.38%, 2Y at 4.72% — curve remains inverted. VIX in mid-teens to low-20s depending on session. Commodities: oil and gold firm on geopolitical premium.
          </p>
        </div>

        {!isPro ? (
          <div className="mm-report-section">
            <div className="mm-report-gate">
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--red)', letterSpacing: 2, marginBottom: 8 }}>
                CLASSIFIED — PRO ONLY
              </div>
              <h2 style={{ fontFamily: 'var(--font-disp)', fontSize: 28, letterSpacing: 2, marginBottom: 12 }}>THREAT ASSESSMENT</h2>
              <p style={{ color: 'var(--text-sec)', fontSize: 13, marginBottom: 20, lineHeight: 1.8 }}>
                Full threat matrix, insider synthesis, and AI intelligence briefing unlock with Pro.
              </p>
              <button className="mm-btn-join" onClick={() => navigate('/pricing')}>
                UNLOCK REPORTS — FROM $29/MO
              </button>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 12 }}>
                14-DAY FREE TRIAL · CANCEL ANYTIME
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mm-report-section">
              <h2>THREAT ASSESSMENT</h2>
              <p>
                Sector risk: ELEVATED. Primary vectors: earnings volatility, commercial real estate exposure at regionals, and European energy pass-through to loan books. Tail risk: geopolitical oil shock repricing credit.
              </p>
            </div>
            <div className="mm-report-section">
              <h2>INTELLIGENCE BRIEFING</h2>
              <p>
                Pro subscribers receive the full Claude-generated brief via email each morning at 6:30 AM ET. Enable in Dashboard → Daily Brief settings.
              </p>
            </div>
          </>
        )}

        <div style={{ textAlign: 'center', padding: '24px' }}>
          <button className="mm-btn-outline" style={{ display: 'inline-block' }} onClick={() => navigate('/map')}>
            ← BACK TO MARKET MAP
          </button>
        </div>
      </div>
    </div>
  );
}
