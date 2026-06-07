/** App Store / Play Store URLs — set in Vercel env when published */
export const APP_DOWNLOAD = {
  ios: (import.meta.env.VITE_IOS_APP_URL as string | undefined)?.trim() || '',
  android: (import.meta.env.VITE_ANDROID_APP_URL as string | undefined)?.trim() || '',
  name: 'WALLST WATCH',
  tagline: 'Banking intelligence in your pocket',
  subtitle: 'Same login as the web terminal · live prices · alerts · CNBC-style market dashboards',
};

export const APP_FEATURES = [
  'Live market dashboards & theme watchlists',
  'Price alerts with push notifications',
  'Insider trades, Fed Watch & earnings',
  'Sync watchlist with your web account',
];

export function appStoreHref(platform: 'ios' | 'android'): string {
  const url = platform === 'ios' ? APP_DOWNLOAD.ios : APP_DOWNLOAD.android;
  if (url) return url;
  return `mailto:hello@wallstwatch.com?subject=${encodeURIComponent('WALLST WATCH app — notify me at launch')}`;
}

export function appStoreAvailable(platform: 'ios' | 'android'): boolean {
  return !!(platform === 'ios' ? APP_DOWNLOAD.ios : APP_DOWNLOAD.android);
}

export function trackAppClick(platform: 'ios' | 'android', surface: string) {
  try {
    const key = 'ww_app_clicks';
    const prev = JSON.parse(localStorage.getItem(key) || '[]') as string[];
    prev.push(`${platform}:${surface}:${Date.now()}`);
    localStorage.setItem(key, JSON.stringify(prev.slice(-50)));
  } catch {
    /* ignore */
  }
}
