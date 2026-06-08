import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../auth/ThemeContext';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate('/')}>
        <span className="navbar-diamond">◆</span>
        <span className="navbar-wordmark">WALLST WATCH</span>
        <span className="navbar-badge">BETA</span>
      </div>

      <ul className="navbar-links">
        <li><NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink></li>
        <li><NavLink to="/map" className={({ isActive }) => isActive ? 'active' : ''}>Market Map</NavLink></li>
        <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>Terminal</NavLink></li>
        <li><NavLink to="/report" className={({ isActive }) => isActive ? 'active' : ''}>Daily Report</NavLink></li>
        <li><NavLink to="/features" className={({ isActive }) => isActive ? 'active' : ''}>Features</NavLink></li>
        <li><NavLink to="/pricing" className={({ isActive }) => isActive ? 'active' : ''}>Pricing</NavLink></li>
        <li><NavLink to="/#app-download" className={({ isActive }) => isActive ? 'active' : ''}>App</NavLink></li>
      </ul>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            cursor: 'pointer',
            padding: '5px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'border-color 0.2s',
          }}
        >
          <span style={{ fontSize: 12 }}>{theme === 'dark' ? '☀' : '◐'}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 1 }}>
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </span>
        </button>

        {user ? (
          <>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)' }}>{user.name}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--red)', border: '1px solid var(--red)', padding: '2px 6px', borderRadius: 2 }}>{user.plan.toUpperCase()}</span>
            <button className="btn-outline" onClick={logout} style={{ padding: '7px 14px' }}>Sign Out</button>
          </>
        ) : (
          <button className="btn-outline" onClick={() => navigate('/login')} style={{ padding: '7px 14px' }}>Sign In</button>
        )}
        <button className="btn-outline" onClick={() => navigate('/dashboard')} style={{ padding: '7px 14px' }}>
          Open Terminal
        </button>
        <button className="btn-primary" onClick={() => navigate('/map')}>Launch Map</button>
      </div>

      <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
        <span /><span /><span />
      </button>

      {open && (
        <div style={{
          position: 'fixed', top: 90, left: 0, right: 0,
          background: 'var(--bg-panel)', borderBottom: '1px solid var(--border)',
          padding: '20px 24px', zIndex: 200,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {[['/', 'Overview'], ['/map', 'Market Map'], ['/dashboard', 'Terminal'], ['/report', 'Daily Report'], ['/features', 'Features'], ['/pricing', 'Pricing'], ['/#app-download', 'Mobile App']].map(([to, label]) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-sec)' }}>
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
