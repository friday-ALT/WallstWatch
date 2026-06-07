import { useEffect, useState } from 'react';
import { APP_DOWNLOAD, appStoreHref, trackAppClick } from '../config/appDownload';

const DISMISS_KEY = 'ww_mobile_app_banner_dismissed_until';
const DISMISS_DAYS = 5;

function detectPlatform(): 'ios' | 'android' {
  if (typeof navigator === 'undefined') return 'ios';
  return /Android/i.test(navigator.userAgent) ? 'android' : 'ios';
}

function isMobileBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  const mobileUa = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const narrow = window.matchMedia('(max-width: 768px)').matches;
  return mobileUa || narrow;
}

export function MobileAppBanner() {
  const [visible, setVisible] = useState(false);
  const platform = detectPlatform();

  useEffect(() => {
    if (!isMobileBrowser()) return;
    const dismissedUntil = localStorage.getItem(DISMISS_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return;
    const timer = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86_400_000));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="mobile-app-banner">
      <div className="mobile-app-banner-inner">
        <div className="mobile-app-banner-icon">◆</div>
        <div className="mobile-app-banner-text">
          <strong>{APP_DOWNLOAD.name}</strong>
          <span>{APP_DOWNLOAD.tagline}</span>
        </div>
        <a
          href={appStoreHref(platform)}
          className="mobile-app-banner-cta"
          onClick={() => trackAppClick(platform, 'mobile-sticky')}
        >
          Get app
        </a>
        <button type="button" className="mobile-app-banner-close" onClick={dismiss} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
