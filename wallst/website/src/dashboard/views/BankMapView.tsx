import { useState } from 'react';
import { BANKS, Bank, riskColor } from '../data/banks';
import { Quote } from '../hooks/useLiveQuotes';

interface Props {
  quotes: Record<string, Quote>;
  onSelect: (b: Bank | null) => void;
  selected: Bank | null;
}

export function BankMapView({ quotes, onSelect, selected }: Props) {
  return (
    <div className="dc-bank-grid">
      {BANKS.map(b => {
        const q = quotes[b.sym];
        const price = q ? q.c : parseFloat(b.pr);
        const dp = q ? q.dp : parseFloat(b.ch);
        const up = dp >= 0;
        const rc = riskColor(b.rl);
        const active = selected?.sym === b.sym;
        return (
          <div
            key={b.sym}
            className={`dc-bank-card${active ? ' active' : ''}`}
            style={{ borderColor: active ? rc : rc + '44', '--rc': rc } as React.CSSProperties}
            onClick={() => onSelect(active ? null : b)}
          >
            <div className="dc-bank-card-top">
              <div className="dc-bank-risk-bar" style={{ background: rc }} />
              <span className="dc-bank-sym">{b.sym}</span>
              <span className="dc-bank-badge" style={{ color: rc, background: rc + '18', border: `1px solid ${rc}55` }}>{b.rk}</span>
            </div>
            <div className="dc-bank-name">{b.nm}</div>
            <div className="dc-bank-price-row">
              <span className="dc-bank-price" style={{ color: up ? '#00e676' : '#ff3b3b' }}>${price.toFixed(2)}</span>
              <span className="dc-bank-chg" style={{ color: up ? '#00e676' : '#ff3b3b' }}>{up ? '▲' : '▼'} {Math.abs(dp).toFixed(2)}%</span>
            </div>
            <div className="dc-bank-stats">
              <div><span className="dc-stat-lbl">MKT CAP</span><span className="dc-stat-val">{b.mc}</span></div>
              <div><span className="dc-stat-lbl">CET1</span><span className="dc-stat-val">{b.c1}</span></div>
              <div><span className="dc-stat-lbl">NI</span><span className="dc-stat-val">{b.ni}</span></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
