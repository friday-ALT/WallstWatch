import { useEffect, useState } from 'react';
import { platform } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { ProGate } from '../components/ProGate';

export function TeamsView() {
  const { token } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [slackUrl, setSlackUrl] = useState('');

  const load = () => {
    if (!token) return;
    platform.teams(token).then(setTeams).catch(() => {});
  };

  useEffect(() => { load(); }, [token]);

  const create = async () => {
    if (!token || !name) return;
    await platform.createTeam(token, name);
    setName('');
    load();
  };

  const saveSlack = async () => {
    if (!token || !slackUrl) return;
    await fetch('/api/platform/slack/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ url: slackUrl }),
    });
    alert('Slack webhook saved — alerts will post there.');
  };

  return (
    <div className="dc-scroll-area">
      <ProGate feature="Team workspaces" requiredPlan="professional">
        <div className="dc-section-label">TEAMS & COLLABORATION</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Team name"
            style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border)', padding: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text)' }} />
          <button type="button" className="dc-sym-chip active" onClick={create}>+ CREATE TEAM</button>
        </div>
        {teams.map(t => (
          <div key={t.id} className="dc-reg-card">
            <div style={{ fontWeight: 700 }}>{t.name}</div>
            <div style={{ fontSize: 9, color: 'var(--text-dim)' }}>ID {t.id}</div>
          </div>
        ))}
        <div className="dc-section-label" style={{ marginTop: 24 }}>SLACK WEBHOOK (ALERTS)</div>
        <input value={slackUrl} onChange={e => setSlackUrl(e.target.value)} placeholder="https://hooks.slack.com/..."
          style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', padding: 8, marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)' }} />
        <button type="button" className="dc-sym-chip" onClick={saveSlack}>SAVE WEBHOOK</button>
      </ProGate>
    </div>
  );
}
