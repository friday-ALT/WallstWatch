import axios from 'axios';
import db from '../db/database.js';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

function userWantsPush(userId: string, kind: 'price' | 'news'): boolean {
  const row = db.prepare(
    'SELECT push_price_alerts, push_news_alerts FROM users WHERE id = ?'
  ).get(userId) as { push_price_alerts: number; push_news_alerts: number } | undefined;
  if (!row) return false;
  return kind === 'price' ? row.push_price_alerts === 1 : row.push_news_alerts === 1;
}

export async function sendPushToUser(userId: string, kind: 'price' | 'news', notification: PushPayload) {
  if (!userWantsPush(userId, kind)) return;

  const tokens = db.prepare('SELECT token FROM push_tokens WHERE user_id = ?').all(userId) as { token: string }[];
  if (!tokens.length) return;

  const messages = tokens.map(({ token }) => ({
    to: token,
    sound: 'default',
    title: notification.title,
    body: notification.body,
    data: notification.data ?? {},
    priority: 'high' as const,
    channelId: 'market-alerts',
  }));

  try {
    const { data } = await axios.post('https://exp.host/--/api/v2/push/send', messages, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      timeout: 10_000,
    });
    const tickets = Array.isArray(data?.data) ? data.data : [];
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (ticket?.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
        db.prepare('DELETE FROM push_tokens WHERE token = ?').run(tokens[i].token);
      }
    }
  } catch {
    /* non-fatal */
  }
}

export function registerPushToken(userId: string, token: string, platform: string) {
  const existing = db.prepare('SELECT id FROM push_tokens WHERE token = ?').get(token) as { id: string } | undefined;
  const now = new Date().toISOString();
  if (existing) {
    db.prepare('UPDATE push_tokens SET user_id = ?, platform = ?, updated_at = ? WHERE token = ?')
      .run(userId, platform, now, token);
    return;
  }
  db.prepare(
    'INSERT INTO push_tokens (id, user_id, token, platform, created_at, updated_at) VALUES (?,?,?,?,?,?)'
  ).run(`${Date.now()}-${userId.slice(-6)}`, userId, token, platform, now, now);
}

export function removePushToken(userId: string, token: string) {
  db.prepare('DELETE FROM push_tokens WHERE user_id = ? AND token = ?').run(userId, token);
}
