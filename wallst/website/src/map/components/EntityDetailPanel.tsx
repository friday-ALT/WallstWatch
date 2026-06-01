import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapEntity, riskColor, SECTOR_COLORS } from '../data/companyTypes';
import { Quote } from '../../dashboard/hooks/useLiveQuotes';
import { StrategicPostureRadar } from './StrategicPostureRadar';
import { RevenueDonut } from './RevenueDonut';
import { hasPlanAccess } from '../../config/features';
import { useAuth } from '../../auth/AuthContext';

const FLAGS: Record<string, string> = {
  US: '🇺🇸', DE: '🇩🇪', CH: '🇨🇭', GB: '🇬🇧', HK: '🇭🇰', FR: '🇫🇷',
  JP: '🇯🇵', CN: '🇨🇳', KR: '🇰🇷', IN: '🇮🇳', AU: '🇦🇺', CA: '🇨🇦',
  BR: '🇧🇷', NL: '🇳🇱', IT: '🇮🇹', ES: '🇪🇸', SG: '🇸🇬', AE: '🇦🇪',
  SA: '🇸🇦', ZA: '🇿🇦', MX: '🇲🇽', TW: '🇹🇼', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰',
};

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() / 1000 - ts) / 60);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

interface Props {
  entity: MapEntity | null;
  quotes: Record<string, Quote>;
  reportCount: number;
}

export function EntityDetailPanel({ entity, quotes, reportCount }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const trialActive = (user as { trialActive?: boolean } | null)?.trialActive ?? false;
  const fullAccess = hasPlanAccess(user?.plan, 'professional', trialActive);
  const [news, setNews] = useState<{ headline: string; source: string; url?: string; datetime?: number }[]>([]);

  useEffect(() => {
    if (!entity) return;
    fetch(`/api/news/${entity.sym}`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setNews(d.slice(0, 6)))
      .catch(() => setNews([]));
  }, [entity?.sym]);

  if (!entity) {
    return (
      <aside className="mm-right mm-right-scroll">
        <div className="mm-detail-header">
          <div className="mm-detail-title">◆ ENTITY DETAIL</div>
        </div>
        <div className="mm-detail-body">
          <div className="mm-detail-empty">
            Click any company on the globe
            <br />
            to view full intelligence
          </div>
        </div>
      </aside>
    );
  }

  const live = quotes[entity.sym];
  const price = live?.c?.toFixed(2) ?? '—';
  const change = live ? `${live.dp >= 0 ? '+' : ''}${live.dp.toFixed(2)}%` : '—';
  const dir = live ? (live.dp >= 0 ? 'up' : 'down') : 'flat';
  const rc = riskColor(entity.risk);
  const sectorColor = SECTOR_COLORS[entity.sector];

  return (
    <aside className="mm-right mm-right-scroll">
      <div className="mm-detail-header">
        <div className="mm-detail-title">◆ ENTITY DETAIL</div>
      </div>
      <div className="mm-detail-body">
        <div className="mm-entity-header-row">
          <span className="mm-entity-flag">{FLAGS[entity.iso] ?? '🌐'}</span>
          <div>
            <div className="mm-entity-sym">{entity.sym}</div>
            <div className="mm-entity-name">{entity.name}</div>
            <div className="mm-entity-loc">{entity.city} · {entity.country}</div>
          </div>
        </div>

        <div className="mm-badge-row">
          <span className="mm-risk-badge" style={{ color: rc, borderColor: rc + '66', background: rc + '18' }}>{entity.risk}</span>
          <span className="mm-sector-badge" style={{ color: sectorColor, borderColor: sectorColor + '66', background: sectorColor + '18' }}>{entity.sector.toUpperCase()}</span>
        </div>

        <div className="mm-risk-gauge">
          <div className="mm-risk-gauge-label">INSTABILITY INDEX</div>
          <div className="mm-risk-gauge-bar">
            <div className="mm-risk-gauge-fill" style={{ width: `${entity.riskScore}%`, background: rc }} />
          </div>
          <div className="mm-risk-gauge-meta">
            <span style={{ color: rc, fontWeight: 700 }}>{entity.riskScore}/100</span>
            <span style={{ color: 'var(--text-dim)' }}>{reportCount} REPORTS</span>
          </div>
        </div>

        <div className="mm-debrief-long">
          {entity.debrief}
        </div>

        <div className="mm-section-block">
          <div className="mm-section-head">
            <span>STRATEGIC POSTURE</span>
            <span className="mm-info-tip" title="AI-scored across 5 dimensions: Credit Strength, Growth Momentum, Regulatory Risk, Market Sentiment, Geopolitical Exposure. Each axis 0–100.">ⓘ</span>
          </div>
          {fullAccess ? (
            <StrategicPostureRadar entity={entity} />
          ) : (
            <div className="mm-premium-inline">
              <span>🔒 PREMIUM FEATURE</span>
              <button className="mm-btn-join-sm" onClick={() => navigate('/pricing')}>UPGRADE</button>
            </div>
          )}
        </div>

        <div className="mm-section-block">
          <div className="mm-section-head">
            <span>FUNDING CHANNEL SIMULATOR</span>
            <span className="mm-info-tip" title="Models how a liquidity shock hits this entity's funding, deposits, and counterparty channels.">ⓘ</span>
          </div>
          <div className="mm-choke-grid">
            {['DEPOSIT RUN', 'REPO MARKET', 'FX SWAPS', 'CP MARKET'].map((ch, i) => (
              <div key={ch} className="mm-choke-item">
                <div className="mm-choke-name">{ch}</div>
                <div className="mm-choke-bar"><div style={{ width: `${35 + i * 15 + entity.riskScore * 0.2}%`, background: i > 2 ? '#ff3b3b' : '#ffc107' }} /></div>
                <div className="mm-choke-status">{i > 2 ? 'ELEVATED' : 'STABLE'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mm-section-block">
          <div className="mm-section-head"><span>REVENUE PROFILE</span></div>
          <div className="mm-stat-inline">
            <span>STATUS</span>
            <strong style={{ color: sectorColor }}>{entity.mktCapB > 100 ? 'MEGA CAP' : entity.mktCapB > 30 ? 'LARGE CAP' : 'MID CAP'}</strong>
          </div>
          <div className="mm-stat-inline">
            <span>MARKET CAP</span>
            <strong>${entity.mktCapB}B</strong>
          </div>
          {fullAccess ? (
            <RevenueDonut slices={entity.revenueMix} title="MIX BY SOURCE" />
          ) : (
            <div className="mm-premium-inline blurred">
              <span>🔒 DEMAND STRUCTURE — PREMIUM</span>
              <button className="mm-btn-join-sm" onClick={() => navigate('/pricing')}>UPGRADE</button>
            </div>
          )}
        </div>

        <div className="mm-section-block">
          <div className="mm-section-head"><span>CAPITAL STRUCTURE</span></div>
          <div className="mm-debt-grid">
            <div>
              <div className="mm-debt-lbl">DEBT / EQUITY</div>
              <div className="mm-debt-val">{entity.debtToGdp?.toFixed(1)}%</div>
            </div>
            <div>
              <div className="mm-debt-lbl">GROSS DEBT</div>
              <div className="mm-debt-val">${entity.grossDebtB}B</div>
            </div>
          </div>
        </div>

        <div className="mm-section-block">
          <div className="mm-section-head"><span>REGULATORY EXPOSURE</span></div>
          <p className="mm-reg-text">{entity.regulatoryNote}</p>
          {entity.sector === 'Banking' && (
            <div className="mm-sanction-tag">
              <span className="mm-sanction-flag">{FLAGS[entity.iso]}</span>
              <div>
                <div className="mm-sanction-title">{entity.iso} · ACTIVE OVERSIGHT</div>
                <div className="mm-sanction-desc">Basel III / CCAR stress testing and cross-border resolution framework applies.</div>
              </div>
            </div>
          )}
        </div>

        <div className="mm-stat-grid">
          <div className="mm-stat-box">
            <div className="mm-stat-lbl">Price</div>
            <div className="mm-stat-val" style={{ color: dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--text)' }}>${price}</div>
          </div>
          <div className="mm-stat-box">
            <div className="mm-stat-lbl">Change</div>
            <div className="mm-stat-val" style={{ color: dir === 'up' ? 'var(--green)' : dir === 'down' ? 'var(--red)' : 'var(--text)' }}>{change}</div>
          </div>
        </div>

        <div className="mm-section-block">
          <div className="mm-section-head"><span>LATEST INTEL</span></div>
          {(news.length ? news : [
            { headline: `${entity.name} in focus as sector rotation accelerates`, source: 'Reuters', datetime: Date.now()/1000 - 3600 },
            { headline: `Analysts revise ${entity.sym} estimates ahead of earnings`, source: 'Bloomberg', datetime: Date.now()/1000 - 7200 },
          ]).map((n, i) => (
            <div key={i} className="mm-intel-item" onClick={() => n.url && window.open(n.url, '_blank')}>
              <div className="mm-intel-headline">{n.headline}</div>
              <div className="mm-intel-meta">{n.source} · {timeAgo(n.datetime ?? Date.now()/1000 - i * 3600)}</div>
            </div>
          ))}
        </div>

        <div className="mm-actions">
          <button className="mm-btn-primary" onClick={() => navigate('/dashboard')}>VIEW ALL INTEL</button>
          <button className="mm-btn-outline" onClick={() => navigate('/report')}>GENERATE REPORT</button>
        </div>
        <div className="mm-generated-at">Analysis generated {new Date().toLocaleDateString()}</div>
      </div>
    </aside>
  );
}
