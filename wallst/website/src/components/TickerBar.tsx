import { useState, useEffect } from 'react';

const TICKERS = [
  { sym: 'JPM',  price: '$283.15', chg: '+1.11%', up: true },
  { sym: 'GS',   price: '$562.40', chg: '-0.86%', up: false },
  { sym: 'MS',   price: '$118.23', chg: '+1.24%', up: true },
  { sym: 'BAC',  price: '$42.67',  chg: '+1.26%', up: true },
  { sym: 'C',    price: '$71.85',  chg: '-0.44%', up: false },
  { sym: 'WFC',  price: '$72.14',  chg: '+1.23%', up: true },
  { sym: 'SPY',  price: '$519.34', chg: '+0.62%', up: true },
  { sym: 'QQQ',  price: '$440.18', chg: '+0.88%', up: true },
  { sym: 'VIX',  price: '18.40',   chg: '-2.14%', up: false },
  { sym: 'DB',   price: '$18.42',  chg: '-1.34%', up: false },
  { sym: 'UBS',  price: '$32.56',  chg: '+0.67%', up: true },
  { sym: 'HSBC', price: '$48.92',  chg: '+0.34%', up: true },
  { sym: '10Y',  price: '4.38%',   chg: '+0.04',  up: true },
  { sym: 'DXY',  price: '105.18',  chg: '-0.11%', up: false },
  { sym: 'WTI',  price: '$79.34',  chg: '+1.20%', up: true },
  { sym: 'GOLD', price: '$2,338',  chg: '+0.41%', up: true },
];

const doubled = [...TICKERS, ...TICKERS];

export function TickerBar() {
  const [clock, setClock] = useState('');
  const [marketOpen, setMarketOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = now.getUTCHours();
      const m = now.getUTCMinutes();
      const s = now.getUTCSeconds();
      setClock(
        String(h).padStart(2, '0') + ':' +
        String(m).padStart(2, '0') + ':' +
        String(s).padStart(2, '0') + ' UTC'
      );
      const mins = h * 60 + m;
      setMarketOpen(mins >= 870 && mins < 1260);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="ticker-wrap">
      {/* Live / Market status tag */}
      <div className="ticker-live-tag">
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: marketOpen ? '#00e676' : '#ffc107', marginRight: 5, flexShrink: 0 }} />
        {marketOpen ? 'LIVE' : 'CLOSED'}
      </div>

      {/* Scrolling tickers */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <div className="ticker-track">
          {doubled.map((t, i) => (
            <div key={i} className="ticker-item">
              <span className="ticker-sym">{t.sym}</span>
              <span className={`ticker-price ${t.up ? 'up' : 'down'}`}>{t.price}</span>
              <span className={`ticker-chg ${t.up ? 'up' : 'down'}`}>{t.chg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Live clock */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text-dim)',
        padding: '0 16px',
        borderLeft: '1px solid var(--border)',
        flexShrink: 0,
        letterSpacing: 1,
        whiteSpace: 'nowrap',
      }}>
        {clock}
      </div>
    </div>
  );
}
