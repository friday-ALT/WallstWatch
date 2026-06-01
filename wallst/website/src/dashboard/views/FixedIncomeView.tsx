import { useEffect, useState } from 'react';
import { platform } from '../../lib/api';

export function FixedIncomeView() {
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    platform.fixedIncome().then(setRows).catch(() => {});
  }, []);

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">FIXED INCOME LITE</div>
      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>Treasury yields & credit ETF proxies — not full bond ref data.</p>
      <div className="dc-table-wrap">
        <table className="dc-table">
          <thead><tr><th>INSTRUMENT</th><th>PRICE/YIELD</th><th>CHG %</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.sym}>
                <td style={{ fontWeight: 700 }}>{r.label}</td>
                <td>{r.price != null ? r.price.toFixed(2) : '—'}</td>
                <td style={{ color: (r.change ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                  {r.change != null ? `${r.change >= 0 ? '+' : ''}${r.change.toFixed(2)}%` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
