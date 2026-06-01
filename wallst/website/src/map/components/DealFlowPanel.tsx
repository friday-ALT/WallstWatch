import { MarketDeal, SECTOR_COLORS } from '../data/companyTypes';
import { COMPANY_BY_SYM } from '../data/companies';

const TYPE_COLOR: Record<string, string> = {
  'M&A': '#ff3b3b',
  PARTNERSHIP: '#2196f3',
  INVESTMENT: '#00e676',
  JV: '#ffc107',
  SUPPLY: '#b388ff',
  ACQUISITION: '#ff6d00',
};

interface Props {
  deals: MarketDeal[];
  selectedDealId: string | null;
  onSelectDeal: (deal: MarketDeal | null) => void;
}

export function DealFlowPanel({ deals, selectedDealId, onSelectDeal }: Props) {
  return (
    <div className="mm-deal-panel">
      <div className="mm-deal-panel-head">
        <span>◆ DEAL FLOW TRACKER</span>
        <span className="mm-deal-count">{deals.length} FLOWS</span>
      </div>
      <p className="mm-deal-hint">Click a deal to highlight the arc on the globe and jump to both companies.</p>
      <div className="mm-deal-list">
        {deals.map(d => {
          const from = COMPANY_BY_SYM[d.fromSym];
          const to = COMPANY_BY_SYM[d.toSym];
          const active = selectedDealId === d.id;
          return (
            <button
              key={d.id}
              type="button"
              className={`mm-deal-item${active ? ' active' : ''}`}
              onClick={() => onSelectDeal(active ? null : d)}
            >
              <div className="mm-deal-item-top">
                <span className="mm-deal-type" style={{ color: TYPE_COLOR[d.type], borderColor: TYPE_COLOR[d.type] + '66' }}>
                  {d.type}
                </span>
                <span className="mm-deal-value">${d.valueB}B</span>
                <span className={`mm-deal-status ${d.status.toLowerCase()}`}>{d.status}</span>
              </div>
              <div className="mm-deal-label">{d.label}</div>
              <div className="mm-deal-route">
                <span style={{ color: from ? SECTOR_COLORS[from.sector] : 'var(--text-sec)' }}>{d.fromSym}</span>
                <span className="mm-deal-arrow">→</span>
                <span style={{ color: to ? SECTOR_COLORS[to.sector] : 'var(--text-sec)' }}>{d.toSym}</span>
              </div>
              <div className="mm-deal-date">{d.date}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
