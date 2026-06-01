import { useState } from 'react';

const SYMBOLS = [
  { sym: 'NYSE:JPM',  label: 'JPM' },
  { sym: 'NYSE:GS',   label: 'GS' },
  { sym: 'NYSE:MS',   label: 'MS' },
  { sym: 'NYSE:BAC',  label: 'BAC' },
  { sym: 'NYSE:C',    label: 'C' },
  { sym: 'NYSE:WFC',  label: 'WFC' },
  { sym: 'AMEX:SPY',  label: 'SPY' },
  { sym: 'NASDAQ:QQQ',label: 'QQQ' },
  { sym: 'CBOE:VIX',  label: 'VIX' },
  { sym: 'NYSE:DB',   label: 'DB' },
  { sym: 'NYSE:UBS',  label: 'UBS' },
  { sym: 'NYSE:SCHW', label: 'SCHW' },
];

const INTERVALS = [
  { label: '1D', val: 'D' },
  { label: '1W', val: 'W' },
  { label: '1M', val: 'M' },
  { label: '3M', val: '3M' },
  { label: '1Y', val: '12M' },
];

export function ChartsView() {
  const [active, setActive] = useState('NYSE:JPM');
  const [interval, setInterval] = useState('D');

  const src = `https://s.tradingview.com/widgetembed/?symbol=${encodeURIComponent(active)}&interval=${interval}&theme=dark&style=1&locale=en&toolbar_bg=%230f1216&enable_publishing=false&hide_top_toolbar=false&hide_legend=false&save_image=true&container_id=tv_chart&backgroundColor=%230a0c0f&gridColor=%231e2530&lineColor=%23ff3b3b`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Symbol selector */}
      <div className="dc-sym-bar" style={{ flexWrap: 'wrap', gap: 4 }}>
        {SYMBOLS.map(s => (
          <button key={s.sym} className={`dc-sym-chip${active === s.sym ? ' active' : ''}`} onClick={() => setActive(s.sym)}>
            {s.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {INTERVALS.map(iv => (
          <button key={iv.val} className={`dc-sym-chip${interval === iv.val ? ' active' : ''}`} onClick={() => setInterval(iv.val)}>
            {iv.label}
          </button>
        ))}
      </div>

      {/* TradingView Chart */}
      <div style={{ flex: 1, position: 'relative', background: '#0a0c0f' }}>
        <iframe
          key={`${active}-${interval}`}
          src={src}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allow="clipboard-write"
          title="TradingView Chart"
        />
      </div>
    </div>
  );
}
