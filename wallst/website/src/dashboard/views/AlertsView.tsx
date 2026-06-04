import { useEffect, useState } from 'react';
import { Quote } from '../hooks/useLiveQuotes';
import { fmtPrice } from '../utils/fmt';
import { Skeleton } from '../components/Skeleton';
import { UNLOCK_ALL } from '../../config/features';
import { ALL_SYMBOLS, DEFAULT_ALERTS, SYMBOLS_BY_CATEGORY } from '../data/marketSymbols';

type AlertType = 'PRICE_ABOVE' | 'PRICE_BELOW' | 'PCT_CHANGE' | 'INSIDER_BUY' | 'EARNINGS';
interface Alert { id: string; sym: string; type: AlertType; threshold: string; active: boolean; triggered?: boolean; }

const TYPE_LABELS: Record<AlertType, string> = {
  PRICE_ABOVE:  'Price rises above',
  PRICE_BELOW:  'Price falls below',
  PCT_CHANGE:   '% change exceeds',
  INSIDER_BUY:  'Insider purchase filed',
  EARNINGS:     'Earnings report filed',
};

interface Props { quotes: Record<string, Quote>; token: string | null; }

export function AlertsView({ quotes, token }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ sym: 'SPY', type: 'PCT_CHANGE' as AlertType, threshold: '' });
  const [triggered, setTriggered] = useState<string[]>([]);

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/alerts', { headers: { Authorization: `Bearer ${token}` } });
          const rows = await res.json();
          if (Array.isArray(rows)) {
            setAlerts(rows.map((r: any) => ({
              id: r.id, sym: r.symbol, type: r.type as AlertType,
              threshold: r.threshold, active: !!r.active,
            })));
          }
          const ev = await fetch('/api/platform/alerts/events', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
          setEvents(Array.isArray(ev) ? ev : []);
        } catch { /* local */ }
      } else {
        try { setAlerts(JSON.parse(localStorage.getItem('ww_alerts') ?? JSON.stringify(DEFAULT_ALERTS))); }
        catch { setAlerts(DEFAULT_ALERTS); }
      }
      setLoaded(true);
    };
    load();
  }, [token]);

  // Check alerts against live prices
  useEffect(() => {
    const fired: string[] = [];
    alerts.forEach(a => {
      if (!a.active) return;
      const q = quotes[a.sym];
      if (!q) return;
      const threshold = parseFloat(a.threshold.replace(/[$%]/g, ''));
      if (a.type === 'PRICE_ABOVE' && q.c > threshold) fired.push(a.id);
      if (a.type === 'PRICE_BELOW' && q.c < threshold) fired.push(a.id);
      if (a.type === 'PCT_CHANGE'  && Math.abs(q.dp) > threshold) fired.push(a.id);
    });
    setTriggered(fired);
  }, [quotes, alerts]);

  const save = (updated: Alert[]) => { setAlerts(updated); localStorage.setItem('ww_alerts', JSON.stringify(updated)); };

  const add = async () => {
    if (token) {
      const rows = await fetch('/api/auth/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sym: form.sym, type: form.type, threshold: form.threshold }),
      }).then(r => r.json());
      setAlerts(rows.map((r: any) => ({
        id: r.id, sym: r.symbol, type: r.type, threshold: r.threshold, active: !!r.active,
      })));
    } else {
      const newAlert: Alert = { id: Date.now().toString(), sym: form.sym, type: form.type, threshold: form.threshold, active: true };
      save([...alerts, newAlert]);
    }
    setForm({ sym: 'SPY', type: 'PCT_CHANGE', threshold: '' }); setAdding(false);
  };

  const toggle = (id: string) => save(alerts.map(a => a.id === id ? { ...a, active: !a.active } : a));
  const remove  = (id: string) => save(alerts.filter(a => a.id !== id));

  if (!loaded) return <div className="dc-scroll-area"><Skeleton rows={6} height={60} gap={10} /></div>;

  const active = alerts.filter(a => a.active).length;
  const fired  = triggered.length;

  return (
    <div className="dc-scroll-area">
      {/* Header stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { l:'ACTIVE ALERTS', v: active.toString(),  c:'#00e676' },
          { l:'TRIGGERED NOW', v: fired.toString(),   c: fired > 0 ? '#ff3b3b' : 'var(--text-dim)' },
          { l:'TOTAL ALERTS',  v: alerts.length.toString(), c:'var(--text)' },
        ].map(s => (
          <div key={s.l} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Triggered banner */}
      {fired > 0 && (
        <div style={{ background: '#ff3b3b18', border: '1px solid #ff3b3b55', borderRadius: 4, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b3b', animation: 'pulse 1s ease-in-out infinite' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#ff3b3b' }}>◆ {fired} ALERT{fired > 1 ? 'S' : ''} TRIGGERED</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-sec)', marginTop: 2 }}>Live price conditions met. Upgrade to Pro for email + push notifications.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div className="dc-section-label" style={{ margin: 0 }}>MY ALERTS</div>
        <button onClick={() => setAdding(!adding)} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '7px 14px', borderRadius: 3, cursor: 'pointer' }}>
          {adding ? '✕ CANCEL' : '+ NEW ALERT'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--red)', borderRadius: 4, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
            <div style={{ flex: '0 0 100px' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>SYMBOL</div>
              <input
                list="alert-symbols"
                value={form.sym}
                onChange={e => setForm(p => ({ ...p, sym: e.target.value.toUpperCase() }))}
                placeholder="SPY"
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }}
              />
              <datalist id="alert-symbols">
                {ALL_SYMBOLS.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>CONDITION</div>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as AlertType }))}
                style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 6px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none' }}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {!['INSIDER_BUY','EARNINGS'].includes(form.type) && (
              <div style={{ flex: '0 0 110px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 4 }}>THRESHOLD</div>
                <input placeholder={form.type === 'PCT_CHANGE' ? '2' : form.sym === 'VIX' ? '22' : '580'}
                  value={form.threshold}
                  onChange={e => setForm(p => ({ ...p, threshold: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            )}
            <button onClick={add} style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '9px 14px', borderRadius: 3, cursor: 'pointer' }}>CREATE →</button>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--text-dim)', letterSpacing: 1, marginBottom: 8 }}>QUICK PICK — INDEXES & BIG MARKET</div>
          {(['Index', 'Sector', 'Mega cap', 'Bank'] as const).map(cat => (
            <div key={cat} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', width: 64, paddingTop: 4 }}>{cat.toUpperCase()}</span>
              {(SYMBOLS_BY_CATEGORY[cat] ?? []).map(s => (
                <button key={s.sym} type="button" onClick={() => setForm(p => ({ ...p, sym: s.sym }))}
                  style={{ background: form.sym === s.sym ? 'var(--red)22' : 'var(--bg)', border: `1px solid ${form.sym === s.sym ? 'var(--red)55' : 'var(--border)'}`, color: form.sym === s.sym ? 'var(--red)' : 'var(--text-sec)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 2, cursor: 'pointer' }}>
                  {s.sym}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Alerts list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.map(a => {
          const isFired = triggered.includes(a.id);
          const q = quotes[a.sym];
          return (
            <div key={a.id} style={{ background: 'var(--bg-card)', border: `1px solid ${isFired ? '#ff3b3b' : a.active ? 'var(--border)' : 'var(--border)'}`, borderLeft: `3px solid ${isFired ? '#ff3b3b' : a.active ? '#00e676' : 'var(--text-dim)'}`, borderRadius: 4, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 14, opacity: a.active ? 1 : 0.5 }}>
              {isFired && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff3b3b', flexShrink: 0, animation: 'pulse 1s ease-in-out infinite' }} />}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--text)', width: 48 }}>{a.sym}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)', marginBottom: 2 }}>{TYPE_LABELS[a.type]}{a.threshold ? ` ${a.threshold}` : ''}</div>
                {q && <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>Current: {fmtPrice(q.c)} ({q.dp >= 0 ? '+' : ''}{q.dp.toFixed(2)}%)</div>}
              </div>
              {isFired && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: '#ff3b3b', border: '1px solid #ff3b3b55', padding: '2px 8px', borderRadius: 2 }}>TRIGGERED</span>}
              <button onClick={() => toggle(a.id)} style={{ background: a.active ? '#00e67622' : 'var(--bg)', border: `1px solid ${a.active ? '#00e67666' : 'var(--border)'}`, color: a.active ? '#00e676' : 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, padding: '4px 10px', borderRadius: 2, cursor: 'pointer', letterSpacing: 1 }}>{a.active ? 'ACTIVE' : 'PAUSED'}</button>
              <button onClick={() => remove(a.id)} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '4px 8px', borderRadius: 2, cursor: 'pointer' }}>✕</button>
            </div>
          );
        })}
      </div>

      {events.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div className="dc-section-label">RECENT ALERT EVENTS (SERVER)</div>
          {events.slice(0, 10).map((e: any) => (
            <div key={e.id} className="dc-rate-row">
              <span>{e.symbol}</span>
              <span style={{ fontSize: 10 }}>{e.message}</span>
              <span style={{ color: 'var(--text-dim)' }}>{e.created_at?.slice(0, 16)}</span>
            </div>
          ))}
        </div>
      )}

      {!UNLOCK_ALL && (
      <div style={{ marginTop: 24, background: 'linear-gradient(135deg,#ff3b3b11,#b388ff11)', border: '1px solid var(--border)', borderRadius: 6, padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--red)', letterSpacing: 3, marginBottom: 8 }}>◆ PRO ALERTS — UPGRADE TO ACTIVATE</div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {['📧 Email within 60 seconds', '📱 Push notifications (mobile app)', '💬 Slack webhook integration', '♾️ Unlimited active alerts', '🔁 Recurring daily digests'].map(f => (
            <div key={f} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)' }}>{f}</div>
          ))}
        </div>
        <button onClick={() => window.location.href = '/pricing'} style={{ marginTop: 14, background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '10px 20px', borderRadius: 3, cursor: 'pointer' }}>
          UPGRADE TO PRO — $29/MO →
        </button>
      </div>
      )}
    </div>
  );
}
