import { Platform } from 'react-native';

const PROD_API_HOST = 'https://wallstwatch-production.up.railway.app';

export const API_BASE =
  Platform.OS === 'web'
    ? '/api'
    : `${PROD_API_HOST}/api`;

export async function apiFetch<T>(path: string, token?: string | null): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function authFetch<T>(
  path: string,
  opts: { token?: string | null; method?: string; body?: object } = {}
): Promise<T> {
  const { token, method = 'GET', body } = opts;
  const res = await fetch(`${API_BASE}/auth${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body != null ? { body: JSON.stringify(body) } : {}),
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}
