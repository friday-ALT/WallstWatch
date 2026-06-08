import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { hasPlanAccess, UNLOCK_ALL } from '../config/features';

const DELAY_MS = 45_000;
const DISMISS_KEY = 'ww_pro_banner_dismissed_until';
const DISMISS_DAYS = 3;
const SKIP_PATHS = ['/pricing', '/signup', '/login'];

const PRO_FEATURES = [
  'Live WebSocket prices',
  'All 12 banks + insider data',
  'Fed Watch & earnings calendar',
  'Full Daily Brief & email alerts',
];

export function ProUpgradeBanner() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, token, loading } = useAuth();
  const [visible, setVisible] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (UNLOCK_ALL || loading) return;
    if (SKIP_PATHS.includes(pathname)) return;
    if (pathname === '/map' || pathname === '/dashboard' || pathname === '/report' || pathname.startsWith('/equity/')) return;

    const trialActive = (user as { trialActive?: boolean } | null)?.trialActive ?? false;
    if (hasPlanAccess(user?.plan, 'pro', trialActive)) return;

    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [loading, user, pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
    setVisible(false);
  };

  const startPro = async () => {
    if (!token) {
      navigate('/signup');
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: 'pro' }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else navigate('/pricing');
    } catch {
      navigate('/pricing');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!visible) return null;

  return createPortal(
    <div className="pro-banner-overlay" onClick={dismiss} role="presentation">
      <div
        className="pro-banner-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="pro-banner-title"
        aria-modal="true"
      >
        <button type="button" className="pro-banner-close" onClick={dismiss} aria-label="Dismiss">
          ✕
        </button>

        <div className="pro-banner-badge">MOST POPULAR</div>
        <div className="pro-banner-kicker">◆ WALLST WATCH PRO</div>
        <h2 id="pro-banner-title" className="pro-banner-title">
          Full terminal access for <span className="pro-banner-price">$2.99</span>/mo
        </h2>
        <p className="pro-banner-sub">
          Bloomberg costs ~$2,000/month. Get live prices, insider filings, and Fed Watch for less than a coffee.
        </p>

        <ul className="pro-banner-features">
          {PRO_FEATURES.map((f) => (
            <li key={f}>
              <span className="pro-banner-check">✓</span>
              {f}
            </li>
          ))}
        </ul>

        <div className="pro-banner-actions">
          <button
            type="button"
            className="pro-banner-cta"
            onClick={startPro}
            disabled={checkingOut}
          >
            {checkingOut ? 'STARTING CHECKOUT…' : 'SUBSCRIBE — $2.99/MO →'}
          </button>
          <button type="button" className="pro-banner-secondary" onClick={() => { dismiss(); navigate('/pricing'); }}>
            Compare plans
          </button>
        </div>

        <p className="pro-banner-foot">
          Cancel anytime · New users get 14 days Pro free
        </p>
      </div>
    </div>,
    document.body
  );
}
