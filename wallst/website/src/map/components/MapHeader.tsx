import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { TerminalNav } from '../../components/TerminalNav';
import { useLeaveTerminal } from '../../terminal/LeaveTerminalContext';

interface Props {
  utc: string;
  bankCount: number;
}

export function MapHeader({ utc, bankCount }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goWorkspace } = useLeaveTerminal();

  return (
    <header className="mm-header mm-header--workspace">
      <div className="mm-header-top">
        <div className="mm-header-left">
          <div className="mm-logo" onClick={() => goWorkspace('/dashboard')} role="button" tabIndex={0}>
            <span className="mm-logo-main">WALLST </span>
            <span className="mm-logo-accent">WATCH</span>
          </div>
          <span className="mm-workspace-badge">WORKSPACE</span>
        </div>
        <div className="mm-header-right">
          <span className="mm-stat-badge amber">{bankCount} COMPANIES</span>
          <span className="mm-stat-badge red">REGIME: ELEVATED</span>
          <div className="mm-live-badge">
            <div className="mm-live-dot" />
            <span>LIVE — {utc} UTC</span>
          </div>
          {user ? (
            <button className="mm-btn-ghost" onClick={() => goWorkspace('/dashboard')}>
              {user.name.split(' ')[0].toUpperCase()}
            </button>
          ) : (
            <button className="mm-btn-ghost" onClick={() => navigate('/login')}>
              LOGIN
            </button>
          )}
          <button className="mm-btn-join" onClick={() => goWorkspace('/dashboard')}>
            {user ? 'TERMINAL' : 'OPEN TERMINAL'}
          </button>
        </div>
      </div>
      <TerminalNav variant="map" />
    </header>
  );
}
