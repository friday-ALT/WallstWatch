import { appStoreAvailable, appStoreHref, trackAppClick } from '../config/appDownload';

interface Props {
  surface?: string;
  layout?: 'row' | 'column';
  size?: 'sm' | 'md';
}

function StoreBadge({
  platform,
  surface,
  size,
}: {
  platform: 'ios' | 'android';
  surface: string;
  size: 'sm' | 'md';
}) {
  const available = appStoreAvailable(platform);
  const isIos = platform === 'ios';
  const label = available
    ? isIos ? 'Download on the' : 'Get it on'
    : isIos ? 'App Store —' : 'Google Play —';
  const store = available
    ? isIos ? 'App Store' : 'Google Play'
    : 'Notify me';

  return (
    <a
      href={appStoreHref(platform)}
      className={`app-store-badge app-store-badge--${size} app-store-badge--${platform}`}
      onClick={() => trackAppClick(platform, surface)}
      target={available ? '_blank' : undefined}
      rel={available ? 'noopener noreferrer' : undefined}
    >
      <span className="app-store-badge-icon" aria-hidden>
        {isIos ? (
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>
        )}
      </span>
      <span className="app-store-badge-text">
        <span className="app-store-badge-label">{label}</span>
        <span className="app-store-badge-store">{store}</span>
      </span>
    </a>
  );
}

export function AppStoreBadges({ surface = 'unknown', layout = 'row', size = 'md' }: Props) {
  return (
    <div className={`app-store-badges app-store-badges--${layout}`}>
      <StoreBadge platform="ios" surface={surface} size={size} />
      <StoreBadge platform="android" surface={surface} size={size} />
    </div>
  );
}
