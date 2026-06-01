export async function apiFetch(path: string, token?: string | null, opts: RequestInit = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed');
  return data;
}

export const platform = {
  deals: () => apiFetch('/api/platform/deals'),
  bankingReg: (sym?: string) => apiFetch(`/api/platform/banking/regulatory${sym ? `?sym=${sym}` : ''}`),
  fxMatrix: () => apiFetch('/api/platform/fx/matrix'),
  fixedIncome: () => apiFetch('/api/platform/fixed-income'),
  newsTagged: (q?: string, sym?: string) =>
    apiFetch(`/api/platform/news/tagged?${new URLSearchParams({ ...(q ? { q } : {}), ...(sym ? { sym } : {}) })}`),
  equity: (sym: string) => apiFetch(`/api/platform/equity/${sym}`),
  optionsFlow: (sym: string) => apiFetch(`/api/platform/options-flow/${sym}`),
  alertEvents: (token: string) => apiFetch('/api/platform/alerts/events', token),
  screens: (token: string) => apiFetch('/api/platform/screens', token),
  saveScreen: (token: string, body: object) => apiFetch('/api/platform/screens', token, { method: 'POST', body: JSON.stringify(body) }),
  layouts: (token: string) => apiFetch('/api/platform/layouts', token),
  saveLayout: (token: string, body: object) => apiFetch('/api/platform/layouts', token, { method: 'POST', body: JSON.stringify(body) }),
  teams: (token: string) => apiFetch('/api/platform/teams', token),
  createTeam: (token: string, name: string) => apiFetch('/api/platform/teams', token, { method: 'POST', body: JSON.stringify({ name }) }),
  report: (token: string, symbol: string, type?: string) =>
    apiFetch('/api/platform/reports/generate', token, { method: 'POST', body: JSON.stringify({ symbol, type }) }),
  briefArchive: (token: string) => apiFetch('/api/platform/brief/archive', token),
};

export const authApi = {
  watchlist: (token: string) => apiFetch('/api/auth/watchlist', token),
  addWatch: (token: string, body: object) => apiFetch('/api/auth/watchlist', token, { method: 'POST', body: JSON.stringify(body) }),
  portfolio: (token: string) => apiFetch('/api/auth/portfolio', token),
  addPosition: (token: string, body: object) => apiFetch('/api/auth/portfolio', token, { method: 'POST', body: JSON.stringify(body) }),
  alerts: (token: string) => apiFetch('/api/auth/alerts', token),
  addAlert: (token: string, body: object) => apiFetch('/api/auth/alerts', token, { method: 'POST', body: JSON.stringify(body) }),
};
