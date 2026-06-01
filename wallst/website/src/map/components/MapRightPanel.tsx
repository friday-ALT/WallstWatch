import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bank, riskColor, riskScore } from '../../dashboard/data/banks';
import { Quote } from '../../dashboard/hooks/useLiveQuotes';
import { hasPlanAccess } from '../../config/features';
import { useAuth } from '../../auth/AuthContext';

const FLAGS: Record<string, string> = {
  US: '🇺🇸', DE: '🇩🇪', CH: '🇨🇭', GB: '🇬🇧', HK: '🇭🇰', FR: '🇫🇷',
};

interface Props {
  bank: Bank | null;
  quotes: Record<string, Quote>;
  reportCount: number;
}

export function MapRightPanel({ bank, quotes, reportCount }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const trialActive = (user as { trialActive?: boolean } | null)?.trialActive ?? false;
  const showPremium = !hasPlanAccess(user?.plan, 'professional', trialActive);
  const [news, setNews] = useState<{ headline: string; source: string; url?: string }[]>([]);

  useEffect(() => {
    if (!bank) return;
    fetch(`/api/news/${bank.sym}`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setNews(d.slice(0, 5)))
      .catch(() => {});
  }, [bank?.sym]);

  if (!bank) {
    return (
      <aside className="mm-right">
        <div className="mm-detail-header">
          <div className="mm-detail-title">◆ ENTITY DETAIL</div>
        </div>
        <div className="mm-detail-body">
          <div className="mm-detail-empty">
            Click a bank HQ on the globe
            <br />
            to view intelligence
          </div>
        </div>
      </aside>
    );
  }

  const live = quotes[bank.sym];
  const price = live?.c?.toFixed(2) ?? bank.pr;
  const change = live ? `${live.dp >= 0 ? '+' : ''}${live.dp.toFixed(2)}%` : bank.ch;
  const dir = live ? (live.dp >= 0 ? 'up' : 'down') : bank.d;
  const rc = riskColor(bank.rl);
  const score = riskScore(bank.rl);
  const debrief = bank.sg.map(s => s.t).join(' ');

  return (
    <aside className="mm-right">
      <div className="mm-detail-header">
        <div className="mm-detail-title">◆ ENTITY DETAIL</div>
      </div>
      <div className="mm-detail-body">
        <div className="mm-entity-flag">{FLAGS[bank.iso] ?? '🏦'}</div>
        <div className="mm-entity-sym">{bank.sym}</div>
        <div className="mm-entity-name">
          {bank.nm} · {bank.city}, {bank.country}
        </div>

        <div className={`mm-stat-badge ${bank.rk === 'MODERATE' ? 'amber' : 'red'}`} style={{ marginBottom: 12, display: 'inline-block' }}>
          {bank.rk}
        </div>

        <div className="mm-risk-gauge">
          <div className="mm-risk-gauge-label">MARKET RISK INDEX</div>
          <div className="mm-risk-gauge-bar">
            <div className="mm-risk-gauge-fill" style={{ width: `${score}%`, background: rc }} />
          </div>
          <div className="mm-risk-gauge-meta">
            <span style={{ color: rc, fontWeight: 700 }}>{score}/100</span>
            <span style={{ color: 'var(--text-dim)' }}>{reportCount} REPORTS</span>
          </div>
        </div>

        <div className="mm-debrief">
          <strong style={{ color: 'var(--text)' }}>Situation debrief. </strong>
          {debrief}
        </div>

        <div className="mm-stat-grid">
          <div className="mm-stat-box">
            <div className="mm-stat-lbl">Price</div>
            <div className="mm-stat-val" style={{ color: dir === 'up' ? 'var(--green)' : 'var(--red)' }}>${price}</div>
          </div>
          <div className="mm-stat-box">
            <div className="mm-stat-lbl">Change</div>
            <div className="mm-stat-val" style={{ color: dir === 'up' ? 'var(--green)' : 'var(--red)' }}>{change}</div>
          </div>
          <div className="mm-stat-box">
            <div className="mm-stat-lbl">Mkt Cap</div>
            <div className="mm-stat-val">{bank.mc}</div>
          </div>
          <div className="mm-stat-box">
            <div className="mm-stat-lbl">CET1</div>
            <div className="mm-stat-val">{bank.c1}</div>
          </div>
        </div>

        <div className="mm-section-lbl">◆ SIGNALS</div>
        {bank.sg.map((s, i) => (
          <div key={i} className={`mm-signal ${s.y}`}>{s.t}</div>
        ))}

        {news.length > 0 && (
          <>
            <div className="mm-section-lbl">◆ LATEST INTEL</div>
            {news.map((n, i) => (
              <div
                key={i}
                className="mm-news-item"
                style={{ padding: '8px 0' }}
                onClick={() => n.url && window.open(n.url, '_blank')}
              >
                <div className="mm-news-headline" style={{ fontSize: 11 }}>{n.headline}</div>
                <div className="mm-news-source">{n.source}</div>
              </div>
            ))}
          </>
        )}

        {showPremium ? (
          <div className="mm-premium-lock">
            <div className="mm-premium-inner">
              <span>🔒</span>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', letterSpacing: 2 }}>PREMIUM</div>
              <div style={{ fontSize: 11, color: 'var(--text-sec)', marginTop: 4 }}>Sector exposure & options flow</div>
              <button className="mm-btn-join" style={{ marginTop: 12 }} onClick={() => navigate('/pricing')}>
                UPGRADE
              </button>
            </div>
          </div>
        ) : (
          <div style={{ margin: '16px 0', padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--cyan)', letterSpacing: 2, marginBottom: 10 }}>SECTOR EXPOSURE</div>
            {[
              ['IB & Markets', '42%', '#ff3b3b'],
              ['Wealth / AM', '28%', '#2196f3'],
              ['Consumer', '18%', '#ffc107'],
              ['Other', '12%', '#8b95a5'],
            ].map(([label, pct, color]) => (
              <div key={label as string} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-sec)' }}>{label}</span>
                  <span style={{ color: color as string }}>{pct}</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: pct as string, background: color as string, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mm-actions">
          <button className="mm-btn-primary" onClick={() => navigate('/dashboard')}>
            OPEN IN TERMINAL →
          </button>
          <button className="mm-btn-outline" onClick={() => navigate('/report')}>
            VIEW DAILY REPORT
          </button>
        </div>
      </div>
    </aside>
  );
}
