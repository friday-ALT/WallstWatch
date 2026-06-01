import { Platform } from 'react-native';

// ── CHANGE THIS to your Mac's local IP address ──────────────────────────────
// Run `ipconfig getifaddr en0` in your terminal to find it
// e.g. '192.168.1.42'
const LOCAL_IP = '10.0.0.129';
// ────────────────────────────────────────────────────────────────────────────

export const API_BASE =
  Platform.OS === 'web'
    ? '/api'
    : `http://${LOCAL_IP}:3001/api`;

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}
