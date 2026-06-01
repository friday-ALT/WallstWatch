import { useEffect, useState } from 'react';
import { platform } from '../../lib/api';
import { useTerminal } from '../../terminal/TerminalProvider';

export function BankingRegView() {
  const { symbol, goEquity } = useTerminal();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    platform.bankingReg().then(setItems).catch(() => {});
  }, []);

  const filtered = items.filter(i => !symbol || i.sym === symbol);

  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">BANKING & REGULATORY — MOAT MODULE</div>
      <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 16 }}>
        CCAR, Basel III, enforcement actions, and liquidity — differentiated vs generic terminals.
      </p>
      {filtered.map(r => (
        <div key={r.id} className="dc-reg-card" style={{ borderLeftColor: severityColor(r.severity) }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <button type="button" className="dc-sym-chip" onClick={() => goEquity(r.sym)}>{r.sym}</button>
            <span className="dc-tag">{r.category}</span>
            <span style={{ color: severityColor(r.severity), fontSize: 9, fontWeight: 700 }}>{r.severity}</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>{r.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-sec)', lineHeight: 1.6 }}>{r.summary}</div>
          <div style={{ fontSize: 9, color: 'var(--text-dim)', marginTop: 8 }}>
            {r.regulator} · {r.date} · {r.status}
          </div>
        </div>
      ))}
    </div>
  );
}

function severityColor(s: string) {
  if (s === 'CRITICAL') return 'var(--red)';
  if (s === 'HIGH') return '#ff6d00';
  if (s === 'MEDIUM') return 'var(--amber)';
  return 'var(--green)';
}
