import { useState } from 'react';

export type Tab =
  | 'brief' | 'charts' | 'macro' | 'fx' | 'screener' | 'breadth'
  | 'banks' | 'credit' | 'insider' | 'compare'
  | 'earnings' | 'fed' | 'options'
  | 'portfolio' | 'watchlist' | 'alerts' | 'research' | 'darkpool'
  | 'calendar' | 'news' | 'deals' | 'regulatory' | 'teams' | 'workspace' | 'fixedincome';

interface TabDef { id: Tab; label: string; icon: string }

const GROUPS: { label: string; color: string; tabs: TabDef[] }[] = [
  {
    label: 'MARKETS',
    color: '#ff3b3b',
    tabs: [
      { id: 'brief',    label: 'Daily Brief', icon: '◆' },
      { id: 'charts',   label: 'Charts',      icon: '▸' },
      { id: 'macro',    label: 'Macro',       icon: '▲' },
      { id: 'fx',       label: 'FX & Bonds',  icon: '◎' },
      { id: 'fixedincome', label: 'Fixed Inc', icon: '▬' },
      { id: 'screener', label: 'Screener',    icon: '⊞' },
      { id: 'breadth',  label: 'Breadth',     icon: '◫' },
      { id: 'news',     label: 'News',        icon: '◉' },
      { id: 'calendar', label: 'Calendar',    icon: '▣' },
    ],
  },
  {
    label: 'BANKING',
    color: '#2196f3',
    tabs: [
      { id: 'banks',   label: 'Bank Map', icon: '▦' },
      { id: 'credit',  label: 'Credit',   icon: '⬛' },
      { id: 'insider', label: 'Insider',  icon: '◈' },
      { id: 'compare', label: 'Compare',  icon: '⇄' },
    ],
  },
  {
    label: 'EVENTS',
    color: '#ffc107',
    tabs: [
      { id: 'earnings', label: 'Earnings', icon: '◑' },
      { id: 'fed',      label: 'Fed Watch', icon: '⊕' },
      { id: 'options',  label: 'Options',   icon: '◐' },
      { id: 'deals',    label: 'Deals',     icon: '⇄' },
    ],
  },
  {
    label: 'BANKING+',
    color: '#00bcd4',
    tabs: [
      { id: 'regulatory', label: 'Regulatory', icon: '⚖' },
    ],
  },
  {
    label: 'TOOLS',
    color: '#00e676',
    tabs: [
      { id: 'portfolio', label: 'Portfolio', icon: '◫' },
      { id: 'watchlist', label: 'Watchlist', icon: '★' },
      { id: 'alerts',    label: 'Alerts',    icon: '◉' },
      { id: 'research',  label: 'Research',  icon: '✦' },
      { id: 'darkpool',  label: 'Dark Pool', icon: '▤' },
      { id: 'workspace', label: 'Workspace', icon: '▦' },
      { id: 'teams',     label: 'Teams',     icon: '👥' },
    ],
  },
];

const MOBILE_CORE: Tab[] = ['brief', 'banks', 'charts', 'portfolio', 'macro'];

interface Props { active: Tab; onChange: (t: Tab) => void; }

export function TabNav({ active, onChange }: Props) {
  const [mobileMore, setMobileMore] = useState(false);
  const activeGroup = GROUPS.find(g => g.tabs.some(t => t.id === active));

  return (
    <>
      {/* Desktop grouped tab bar */}
      <nav className="dc-tabbar-grouped">
        {GROUPS.map(g => (
          <div key={g.label} className="dc-tab-group">
            <div className="dc-tab-group-label" style={{ color: g.color }}>{g.label}</div>
            <div className="dc-tab-group-tabs">
              {g.tabs.map(t => (
                <button
                  key={t.id}
                  className={`dc-tab2${active === t.id ? ' active' : ''}`}
                  style={active === t.id ? { color: g.color, borderBottomColor: g.color } : {}}
                  onClick={() => onChange(t.id)}
                >
                  <span className="dc-tab-icon">{t.icon}</span>
                  <span className="dc-tab-label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Mobile tab bar — core 5 + More */}
      <nav className="dc-tabbar-mobile">
        {MOBILE_CORE.map(id => {
          const tab = GROUPS.flatMap(g => g.tabs).find(t => t.id === id)!;
          const grp = GROUPS.find(g => g.tabs.some(t => t.id === id))!;
          return (
            <button key={id} className={`dc-tab2${active === id ? ' active' : ''}`}
              style={active === id ? { color: grp.color, borderBottomColor: grp.color } : {}}
              onClick={() => { onChange(id); setMobileMore(false); }}>
              <span className="dc-tab-icon">{tab.icon}</span>
              <span className="dc-tab-label" style={{ fontSize: 8 }}>{tab.label.toUpperCase()}</span>
            </button>
          );
        })}
        <button className={`dc-tab2${mobileMore ? ' active' : ''}`} onClick={() => setMobileMore(m => !m)}>
          <span className="dc-tab-icon">⋯</span>
          <span className="dc-tab-label" style={{ fontSize: 8 }}>MORE</span>
        </button>

        {/* Mobile overflow drawer */}
        {mobileMore && (
          <div className="dc-mobile-overflow">
            {GROUPS.map(g => (
              <div key={g.label} style={{ marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: g.color, letterSpacing: 2, marginBottom: 6 }}>{g.label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {g.tabs.filter(t => !MOBILE_CORE.includes(t.id)).map(t => (
                    <button key={t.id} className={`dc-sym-chip${active === t.id ? ' active' : ''}`}
                      style={active === t.id ? { background: g.color, borderColor: g.color } : {}}
                      onClick={() => { onChange(t.id); setMobileMore(false); }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>
    </>
  );
}
