import bcrypt from 'bcryptjs';
import db from './db/database.js';

export const DEMO_EMAIL = 'demo@wallstwatch.com';
export const DEMO_PASSWORD = 'demo1234';

export function seedDemoUser() {
  if (process.env.UNLOCK_ALL !== 'true') return;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL) as { id: string } | undefined;
  if (existing) {
    db.prepare("UPDATE users SET plan = 'institutional', trial_ends = NULL WHERE email = ?").run(DEMO_EMAIL);
    return;
  }

  const id = 'demo-institutional';
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO users (id, email, password_hash, name, plan, trial_ends, created_at, daily_brief_email) VALUES (?,?,?,?,?,?,?,1)'
  ).run(id, DEMO_EMAIL, hash, 'Demo User', 'institutional', null, now);

  for (const sym of ['JPM', 'GS', 'MS', 'BAC', 'SPY', 'QQQ', 'NVDA']) {
    db.prepare('INSERT OR IGNORE INTO watchlist (user_id, symbol, conviction, notes, added_at) VALUES (?,?,?,?,?)')
      .run(id, sym, 'NEUTRAL', 'Demo watchlist', now);
  }
  db.prepare('INSERT OR IGNORE INTO portfolio (user_id, symbol, shares, avg_cost) VALUES (?,?,?,?)')
    .run(id, 'JPM', 100, 240);
  db.prepare('INSERT OR IGNORE INTO portfolio (user_id, symbol, shares, avg_cost) VALUES (?,?,?,?)')
    .run(id, 'GS', 50, 480);

  console.log('◆ Demo user ready:', DEMO_EMAIL, '/', DEMO_PASSWORD);
}
