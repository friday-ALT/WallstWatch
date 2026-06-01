import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const NAV = [
  { path: '/map', label: 'MARKET MAP' },
  { path: '/report', label: 'DAILY REPORT' },
  { path: '/dashboard', label: 'DASHBOARD' },
  { path: '/pricing', label: 'PRICING' },
];

interface Props {
  utc: string;
  bankCount: number;
}

export function MapHeader({ utc, bankCount }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <header className="mm-header">
      <div className="mm-header-left">
        <div className="mm-logo" onClick={() => navigate('/')}>
          <span className="mm-logo-main">WALLST </span>
          <span className="mm-logo-accent">WATCH</span>
        </div>
        <nav className="mm-nav">
          {NAV.map(n => (
            <button
              key={n.path}
              className={`mm-nav-tab${pathname === n.path ? ' active' : ''}`}
              onClick={() => navigate(n.path)}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="mm-header-right">
        <span className="mm-stat-badge amber">{bankCount} COMPANIES</span>
        <span className="mm-stat-badge red">REGIME: ELEVATED</span>
        <div className="mm-live-badge">
          <div className="mm-live-dot" />
          <span>LIVE — {utc} UTC</span>
        </div>
        {user ? (
          <button className="mm-btn-ghost" onClick={() => navigate('/dashboard')}>
            {user.name.split(' ')[0].toUpperCase()}
          </button>
        ) : (
          <button className="mm-btn-ghost" onClick={() => navigate('/login')}>
            LOGIN
          </button>
        )}
        <button className="mm-btn-join" onClick={() => navigate(user ? '/dashboard' : '/signup')}>
          {user ? 'TERMINAL' : 'JOIN FREE'}
        </button>
      </div>
    </header>
  );
}
