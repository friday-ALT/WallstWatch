import bcrypt from 'bcryptjs';
import db from './db/database.js';

/** Apple App Store review — always seeded; credentials shared in App Store Connect only */
export const REVIEW_EMAIL = 'review@wallstwatch.com';
export const REVIEW_PASSWORD = 'WallstReview2026';

const REVIEW_ID = 'apple-app-review';
const WATCHLIST = ['SPY', 'QQQ', 'JPM', 'GS', 'AAPL', 'NVDA'];

export function seedReviewUser() {
  const hash = bcrypt.hashSync(REVIEW_PASSWORD, 10);
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(REVIEW_EMAIL) as
    | { id: string }
    | undefined;

  if (existing) {
    db.prepare(
      'UPDATE users SET password_hash = ?, plan = ?, trial_ends = NULL, name = ? WHERE email = ?',
    ).run(hash, 'pro', 'App Review', REVIEW_EMAIL);
  } else {
    db.prepare(
      'INSERT INTO users (id, email, password_hash, name, plan, trial_ends, created_at, daily_brief_email) VALUES (?,?,?,?,?,?,?,0)',
    ).run(REVIEW_ID, REVIEW_EMAIL, hash, 'App Review', 'pro', null, now);
  }

  const userId =
    (db.prepare('SELECT id FROM users WHERE email = ?').get(REVIEW_EMAIL) as { id: string }).id;

  for (const sym of WATCHLIST) {
    db.prepare(
      'INSERT OR IGNORE INTO watchlist (user_id, symbol, conviction, notes, added_at) VALUES (?,?,?,?,?)',
    ).run(userId, sym, 'NEUTRAL', 'App Review sample watchlist', now);
  }

  db.prepare('INSERT OR IGNORE INTO portfolio (user_id, symbol, shares, avg_cost) VALUES (?,?,?,?)').run(
    userId,
    'JPM',
    50,
    280,
  );

  console.log('◆ App Review account ready:', REVIEW_EMAIL);
}
