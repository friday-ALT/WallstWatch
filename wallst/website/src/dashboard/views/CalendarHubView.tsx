import { useEffect, useState } from 'react';
import { ProGate } from '../components/ProGate';

export function CalendarHubView() {
  const [economic, setEconomic] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any[]>([]);
  const [tab, setTab] = useState<'economic' | 'earnings'>('economic');

  useEffect(() => {
    fetch('/api/economic-calendar').then(r => r.json()).then(setEconomic).catch(() => {});
    const from = new Date().toISOString().split('T')[0];
    const to = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
    fetch(`/api/earnings?from=${from}&to=${to}`).then(r => r.json()).then(setEarnings).catch(() => {});
  }, []);

  const exportIcs = (type: string) => {
    window.open(`/api/platform/calendar/ics?type=${type}`, '_blank');
  };

  return (
    <div className="dc-scroll-area">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="dc-section-label" style={{ margin: 0 }}>CALENDAR HUB</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="dc-sym-chip" onClick={() => exportIcs('economic')}>↓ ICS ECONOMIC</button>
          <button type="button" className="dc-sym-chip" onClick={() => exportIcs('earnings')}>↓ ICS EARNINGS</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {(['economic', 'earnings'] as const).map(t => (
          <button key={t} type="button" className={`dc-sym-chip${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>
      <ProGate feature="Full economic & earnings calendar" requiredPlan="pro">
        <div className="dc-table-wrap">
          <table className="dc-table">
            <thead>
              <tr>
                {tab === 'economic'
                  ? ['DATE', 'TIME', 'EVENT', 'COUNTRY', 'IMPACT'].map(h => <th key={h}>{h}</th>)
                  : ['DATE', 'SYMBOL', 'EPS EST', 'REV EST', 'HOUR'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {tab === 'economic'
                ? economic.slice(0, 40).map((e, i) => (
                    <tr key={i}>
                      <td>{e.date}</td><td>{e.time ?? '—'}</td><td>{e.event}</td>
                      <td>{e.country}</td><td style={{ color: e.impact === 'high' ? 'var(--red)' : 'var(--text-dim)' }}>{e.impact ?? '—'}</td>
                    </tr>
                  ))
                : earnings.slice(0, 50).map((e, i) => (
                    <tr key={i}>
                      <td>{e.date}</td><td style={{ fontWeight: 700 }}>{e.symbol}</td>
                      <td>{e.epsEstimate ?? '—'}</td><td>{e.revenueEstimate ?? '—'}</td><td>{e.hour ?? '—'}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </ProGate>
    </div>
  );
}
