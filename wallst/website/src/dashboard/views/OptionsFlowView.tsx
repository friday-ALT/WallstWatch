import { useEffect, useState } from 'react';
import { platform } from '../../lib/api';
import { useTerminal } from '../../terminal/TerminalProvider';

const SYMS = ['JPM','GS','MS','BAC','SPY','QQQ','AAPL','NVDA'];

export function OptionsFlowView() {
  const { symbol } = useTerminal();
  const [filter, setFilter] = useState<'ALL'|'CALL'|'PUT'>('ALL');
  const [flow, setFlow] = useState<any[]>([]);
  const [simulated, setSimulated] = useState(false);
  const [symFilter, setSymFilter] = useState(symbol);

  useEffect(() => { setSymFilter(symbol); }, [symbol]);

  useEffect(() => {
    platform.optionsFlow(symFilter).then((d: any) => {
      setFlow(d.flow ?? []);
      setSimulated(!!d.simulated);
    }).catch(() => setFlow([]));
  }, [symFilter]);

  const filtered = flow.filter(f =>
    filter === 'ALL' || f.type === filter
  );

  const calls = flow.filter(f => f.type === 'CALL').length;
  const puts = flow.filter(f => f.type === 'PUT').length;
  const ratio = calls + puts > 0 ? ((calls / (calls + puts)) * 100).toFixed(0) : '50';

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">OPTIONS FLOW — {symFilter}</div>
      {simulated && (
        <div style={{ fontSize: 10, color: 'var(--amber)', marginBottom: 12, padding: 8, border: '1px solid var(--amber)', borderRadius: 4 }}>
          SIMULATED — Live OPRA feed requires vendor key. Showing chain volume when available.
        </div>
      )}
      <div className="dc-sym-bar" style={{ marginBottom: 16 }}>
        {SYMS.map(s => (
          <button key={s} type="button" className={`dc-sym-chip${symFilter === s ? ' active' : ''}`} onClick={() => setSymFilter(s)}>{s}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
        <div className="dc-stat-card"><div className="dc-stat-lbl">CALL %</div><div style={{ color: 'var(--green)' }}>{ratio}%</div></div>
        <div className="dc-stat-card"><div className="dc-stat-lbl">UNUSUAL</div><div>{filtered.length}</div></div>
        <div className="dc-stat-card"><div className="dc-stat-lbl">SYMBOL</div><div>{symFilter}</div></div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['ALL', 'CALL', 'PUT'] as const).map(f => (
          <button key={f} type="button" className={`dc-sym-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>
      <div className="dc-table-wrap">
        <table className="dc-table">
          <thead>
            <tr><th>TYPE</th><th>STRIKE</th><th>EXP</th><th>VOL</th><th>OI</th><th>PREMIUM</th></tr>
          </thead>
          <tbody>
            {filtered.map((f, i) => (
              <tr key={i}>
                <td style={{ color: f.type === 'CALL' ? 'var(--green)' : 'var(--red)' }}>{f.type}</td>
                <td>{f.strike}</td>
                <td>{f.expiry}</td>
                <td>{f.volume}</td>
                <td>{f.openInterest}</td>
                <td>${f.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="dc-loading">No unusual volume — try another symbol or check Finnhub options entitlement.</div>}
    </div>
  );
}
