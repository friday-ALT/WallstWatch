import { useLocation } from 'react-router-dom';
import { useLeaveTerminal } from '../terminal/LeaveTerminalContext';
import { workspaceTabForPath } from '../terminal/workspace';

const TABS = [
  { path: '/map' as const, label: 'Market Map', short: 'MAP', icon: '◆' },
  { path: '/dashboard' as const, label: 'Terminal', short: 'TERMINAL', icon: '▣' },
  { path: '/report' as const, label: 'Daily Report', short: 'REPORT', icon: '◈' },
];

interface Props {
  variant?: 'map' | 'dashboard';
  equitySymbol?: string;
}

export function TerminalNav({ variant = 'dashboard', equitySymbol }: Props) {
  const { pathname } = useLocation();
  const { goWorkspace, leaveTo } = useLeaveTerminal();
  const activeTab = workspaceTabForPath(pathname);

  return (
    <nav className={`terminal-nav terminal-nav--${variant}`} aria-label="Workspace navigation">
      <div className="terminal-nav-tabs">
        {TABS.map((tab) => {
          const active = activeTab === tab.path;
          return (
            <button
              key={tab.path}
              type="button"
              className={`terminal-nav-tab${active ? ' active' : ''}`}
              onClick={() => goWorkspace(tab.path)}
              title={tab.label}
            >
              <span className="terminal-nav-tab-icon">{tab.icon}</span>
              <span className="terminal-nav-tab-label">{tab.label}</span>
              <span className="terminal-nav-tab-short">{tab.short}</span>
            </button>
          );
        })}
        {equitySymbol && (
          <span className="terminal-nav-equity" title="Current symbol">
            ◎ {equitySymbol}
          </span>
        )}
      </div>
      <div className="terminal-nav-exit">
        <button type="button" className="terminal-nav-exit-btn" onClick={() => leaveTo('/pricing')}>
          Pricing
        </button>
        <button type="button" className="terminal-nav-exit-btn terminal-nav-exit-btn--home" onClick={() => leaveTo('/')}>
          ← Website
        </button>
      </div>
    </nav>
  );
}
