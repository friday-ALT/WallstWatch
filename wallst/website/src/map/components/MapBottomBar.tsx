import { MarketDeal } from '../data/companyTypes';
import type { MapEntity } from '../data/companyTypes';

const ALERTS = [
  { level: 'critical' as const, text: 'Deal flow: $59.5B XOM-CVX merger integration ongoing' },
  { level: 'critical' as const, text: '320 global entities tracked across 24 nations' },
  { level: 'high' as const, text: 'Banking Radar: European spreads widening vs US G-SIBs' },
  { level: 'high' as const, text: 'MSFT-OpenAI strategic investment — AI capex cycle' },
  { level: 'critical' as const, text: 'UBS-CS integration — legacy book runoff continues' },
  { level: 'high' as const, text: 'Live: 15 active M&A / partnership arcs on globe' },
];

interface Props {
  deals?: MarketDeal[];
  selected?: MapEntity | null;
  selectedDeal?: MarketDeal | null;
}

export function MapBottomBar({ deals = [], selected, selectedDeal }: Props) {
  const dealAlerts = deals.slice(0, 3).map(d => ({
    level: 'high' as const,
    text: `${d.type}: ${d.label} ($${d.valueB}B)`,
  }));
  const all = [...dealAlerts, ...ALERTS];
  if (selectedDeal) {
    all.unshift({ level: 'critical', text: `◆ DEAL: ${selectedDeal.fromSym} → ${selectedDeal.toSym} · ${selectedDeal.label}` });
  }
  if (selected) {
    all.unshift({ level: 'critical', text: `◆ ${selected.sym} selected — ${selected.risk} risk · ${selected.sector}` });
  }
  const doubled = [...all, ...all];

  return (
    <div className="mm-bottom">
      <span className="mm-bottom-label critical">◆ CRITICAL</span>
      <div className="mm-bottom-scroll">
        <div className="mm-bottom-inner">
          {doubled.map((a, i) => (
            <div key={i} className="mm-alert-item">
              <span className={`mm-alert-tag ${a.level}`}>{a.level.toUpperCase()}</span>
              <span className="mm-alert-text">{a.text}</span>
            </div>
          ))}
        </div>
      </div>
      <span className="mm-bottom-label" style={{ color: 'var(--red)' }}>◆ LIVE</span>
    </div>
  );
}
