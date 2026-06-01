import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { platform } from '../../lib/api';

export function DealsIntelView() {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    platform.deals().then(setDeals).catch(() => {});
  }, []);

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">DEAL FLOW INTELLIGENCE — {deals.length} DEALS</div>
      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>
        Curated M&A, partnerships, and strategic investments. View on map via Deal Flows layer.
      </p>
      <button type="button" className="dc-sym-chip active" style={{ marginBottom: 16 }} onClick={() => navigate('/map')}>
        OPEN MARKET MAP →
      </button>
      {deals.map(d => (
        <div key={d.id} className="dc-deal-card">
          <div className="dc-deal-card-top">
            <span className="dc-tag">{d.type}</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>${d.valueB}B</span>
            <span className={`dc-tag status-${d.status.toLowerCase()}`}>{d.status}</span>
          </div>
          <div style={{ fontSize: 13, marginBottom: 8 }}>{d.label}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {d.fromSym} → {d.toSym}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 6 }}>
            {d.date} · {d.source}
            {d.sourceUrl && (
              <a href={d.sourceUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8, color: 'var(--cyan)' }}>SOURCE</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
