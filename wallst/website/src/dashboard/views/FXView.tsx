import { useEffect, useState } from 'react';
import { platform } from '../../lib/api';

const FX_PAIRS_STATIC = [
  { pair: 'EUR/USD', rate: '1.0842', chg: '+0.12%', up: true },
  { pair: 'GBP/USD', rate: '1.2734', chg: '+0.08%', up: true },
  { pair: 'USD/JPY', rate: '153.42', chg: '-0.34%', up: false },
  { pair: 'USD/CHF', rate: '0.9012', chg: '-0.09%', up: false },
];

const TREASURIES = [
  { tenor: '2Y', yield: '4.72%', chg: '-3bps', up: false },
  { tenor: '5Y', yield: '4.51%', chg: '-5bps', up: false },
  { tenor: '10Y', yield: '4.38%', chg: '-4bps', up: false },
  { tenor: '30Y', yield: '4.54%', chg: '-3bps', up: false },
];

const COMMODITIES = [
  { name: 'Gold (XAU)', price: '$2,312', chg: '+0.4%', up: true },
  { name: 'WTI Crude', price: '$79.24', chg: '-0.6%', up: false },
];

export function FXView() {
  const [time, setTime] = useState('');
  const [liveFx, setLiveFx] = useState<any[]>([]);

  useEffect(() => {
    const t = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    t();
    const id = setInterval(t, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    platform.fxMatrix().then(setLiveFx).catch(() => {});
  }, []);

  const fxRows = liveFx.length
    ? liveFx.map(f => ({
        pair: f.pair,
        rate: f.price != null ? String(f.price) : '—',
        chg: f.change != null ? `${f.change >= 0 ? '+' : ''}${f.change.toFixed(2)}%` : '—',
        up: (f.change ?? 0) >= 0,
      }))
    : FX_PAIRS_STATIC;

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">FX · FIXED INCOME · COMMODITIES — {time} EST</div>
      {liveFx.length > 0 && (
        <div style={{ fontSize: 9, color: 'var(--green)', marginBottom: 8 }}>● LIVE FX MATRIX</div>
      )}
      <div className="dc-three-col">
        <div>
          <div className="dc-section-label">FOREIGN EXCHANGE</div>
          <div className="dc-table">
            {fxRows.map((fx, i) => (
              <div key={i} className="dc-table-row">
                <span className="dc-table-label" style={{ fontWeight: 700, width: 80 }}>{fx.pair}</span>
                <span className="dc-table-val" style={{ color: fx.up ? '#00e676' : '#ff3b3b' }}>{fx.rate}</span>
                <span className="dc-table-note" style={{ color: fx.up ? '#00e676' : '#ff3b3b' }}>{fx.chg}</span>
              </div>
            ))}
          </div>
          <div className="dc-section-label" style={{ marginTop: 20 }}>COMMODITIES</div>
          <div className="dc-table">
            {COMMODITIES.map((c, i) => (
              <div key={i} className="dc-table-row">
                <span className="dc-table-label" style={{ flex: 1 }}>{c.name}</span>
                <span className="dc-table-val" style={{ color: c.up ? '#00e676' : '#ff3b3b' }}>{c.price}</span>
                <span className="dc-table-note" style={{ color: c.up ? '#00e676' : '#ff3b3b', width: 52 }}>{c.chg}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="dc-section-label">US TREASURY YIELDS</div>
          <div className="dc-table">
            {TREASURIES.map((t, i) => (
              <div key={i} className="dc-table-row">
                <span className="dc-table-label" style={{ width: 40 }}>{t.tenor}</span>
                <span className="dc-table-val">{t.yield}</span>
                <span className="dc-table-note">{t.chg}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="dc-section-label">CREDIT MARKET STATUS</div>
          {[
            { label: 'IG Spreads', val: 'TIGHT', color: '#00e676' },
            { label: 'HY Spreads', val: 'NORMAL', color: '#ffc107' },
            { label: 'CDS Market', val: 'CALM', color: '#00e676' },
          ].map((item, i) => (
            <div key={i} className="dc-table-row">
              <span className="dc-table-label">{item.label}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: item.color }}>{item.val}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
