import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { APP_DOWNLOAD, APP_FEATURES } from '../config/appDownload';
import { isWorkspaceRoute } from '../terminal/workspace';

const DELAY_MS = 10_000;
const DISMISS_KEY = 'ww_app_popup_dismissed_until';
const DISMISS_DAYS = 7;
const SKIP_PATHS = ['/login', '/signup'];

export function AppDownloadPopup() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (SKIP_PATHS.includes(pathname) || isWorkspaceRoute(pathname)) return;

    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [pathname]);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
    setVisible(false);
  };

  if (!visible) return null;

  return createPortal(
    <div className="app-popup-overlay" onClick={dismiss} role="presentation">
      <div
        className="app-popup-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="app-popup-title"
        aria-modal="true"
      >
        <button type="button" className="app-popup-close" onClick={dismiss} aria-label="Dismiss">
          ✕
        </button>

        <div className="app-popup-phone" aria-hidden>
          <div className="app-popup-phone-inner">
            <span className="app-popup-phone-logo">WALLST</span>
            <span className="app-popup-phone-watch">WATCH</span>
          </div>
        </div>

        <div className="app-popup-badge">COMING TO MOBILE</div>
        <h2 id="app-popup-title" className="app-popup-title">
          {APP_DOWNLOAD.name} app
        </h2>
        <p className="app-popup-sub">{APP_DOWNLOAD.tagline}</p>

        <ul className="app-popup-features">
          {APP_FEATURES.slice(0, 3).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        <p className="app-popup-note">
          App Store & Google Play links coming soon — same account as the web terminal.
        </p>

        <button type="button" className="app-popup-cta" onClick={dismiss}>
          Got it
        </button>
      </div>
    </div>,
    document.body
  );
}
