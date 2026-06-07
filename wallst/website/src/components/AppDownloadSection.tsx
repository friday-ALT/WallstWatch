import { APP_DOWNLOAD, APP_FEATURES } from '../config/appDownload';
import { AppStoreBadges } from './AppStoreBadges';

interface Props {
  id?: string;
  compact?: boolean;
}

export function AppDownloadSection({ id = 'app-download', compact = false }: Props) {
  if (compact) {
    return (
      <div className="app-dl-compact" id={id}>
        <div className="app-dl-compact-icon">📱</div>
        <div className="app-dl-compact-body">
          <div className="app-dl-compact-title">Get the mobile app</div>
          <div className="app-dl-compact-sub">{APP_DOWNLOAD.subtitle}</div>
          <AppStoreBadges surface="dashboard-compact" size="sm" />
        </div>
      </div>
    );
  }

  return (
    <section className="app-dl-section" id={id}>
      <div className="app-dl-inner">
        <div className="app-dl-copy">
          <div className="section-eyebrow">Mobile app</div>
          <h2 className="app-dl-headline">
            Take the terminal<br />
            <span className="app-dl-headline-accent">everywhere</span>
          </h2>
          <p className="app-dl-desc">{APP_DOWNLOAD.subtitle}</p>

          <ul className="app-dl-features">
            {APP_FEATURES.map((f) => (
              <li key={f}>
                <span className="app-dl-check">✓</span>
                {f}
              </li>
            ))}
          </ul>

          <AppStoreBadges surface="landing-section" />
          <p className="app-dl-note">
            Free to download · Sign in with the same account as wallst-watch.vercel.app
          </p>
        </div>

        <div className="app-dl-phone" aria-hidden>
          <div className="app-dl-phone-frame">
            <div className="app-dl-phone-notch" />
            <div className="app-dl-phone-screen">
              <div className="app-dl-phone-header">
                <span className="app-dl-phone-logo">◆ WALLST</span>
                <span className="app-dl-phone-watch">WATCH</span>
              </div>
              <div className="app-dl-phone-tab">Dashboard</div>
              {[
                { t: 'Credit stress', syms: ['HYG', 'LQD', 'XLF'] },
                { t: 'Treasuries', syms: ['SHY', 'TLT', 'IEF'] },
                { t: 'Inflation', syms: ['GLD', 'USO', 'CPER'] },
              ].map((bucket) => (
                <div key={bucket.t} className="app-dl-phone-card">
                  <div className="app-dl-phone-card-title">{bucket.t}</div>
                  {bucket.syms.map((s) => (
                    <div key={s} className="app-dl-phone-row">
                      <span>{s}</span>
                      <span className="app-dl-phone-price">Live</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
