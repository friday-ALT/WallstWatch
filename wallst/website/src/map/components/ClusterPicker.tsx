import { MapEntity, SECTOR_COLORS } from '../data/companyTypes';

interface Props {
  title: string;
  companies: MapEntity[];
  selectedSym?: string;
  onPick: (e: MapEntity) => void;
  onClose: () => void;
  variant?: 'overlay' | 'sidebar';
}

export function ClusterPicker({ title, companies, selectedSym, onPick, onClose, variant = 'overlay' }: Props) {
  return (
    <div className={`mm-cluster-picker${variant === 'sidebar' ? ' sidebar' : ''}`}>
      <div className="mm-cluster-header">
        <div>
          <div className="mm-cluster-title">◆ {title}</div>
          <div className="mm-cluster-sub">{companies.length} COMPANIES — CLICK TO SELECT</div>
        </div>
        <button type="button" className="mm-cluster-close" onClick={onClose}>✕</button>
      </div>
      <div className="mm-cluster-list">
        {companies.map(c => (
          <button
            key={c.sym}
            type="button"
            className={`mm-cluster-item${selectedSym === c.sym ? ' active' : ''}`}
            onClick={() => onPick(c)}
          >
            <span className="mm-cluster-sym" style={{ color: SECTOR_COLORS[c.sector] }}>{c.sym}</span>
            <span className="mm-cluster-name">{c.name}</span>
            <span className="mm-cluster-meta">{c.sector} · ${c.mktCapB}B</span>
          </button>
        ))}
      </div>
    </div>
  );
}
