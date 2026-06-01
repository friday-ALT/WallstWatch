import db from './database.js';

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS saved_screens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      name       TEXT NOT NULL,
      filters    TEXT NOT NULL,
      symbols    TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS terminal_layouts (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      name       TEXT NOT NULL,
      panels     TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS teams (
      id         TEXT PRIMARY KEY,
      owner_id   TEXT NOT NULL,
      name       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS team_members (
      team_id    TEXT NOT NULL,
      user_id    TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'member',
      PRIMARY KEY (team_id, user_id)
    );
    CREATE TABLE IF NOT EXISTS team_watchlists (
      team_id    TEXT NOT NULL,
      symbol     TEXT NOT NULL,
      added_by   TEXT,
      notes      TEXT,
      PRIMARY KEY (team_id, symbol)
    );
    CREATE TABLE IF NOT EXISTS brief_archive (
      id         TEXT PRIMARY KEY,
      user_id    TEXT,
      title      TEXT NOT NULL,
      body       TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS alert_events (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      alert_id   TEXT NOT NULL,
      symbol     TEXT NOT NULL,
      message    TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      read       INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS slack_webhooks (
      user_id    TEXT PRIMARY KEY,
      url        TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      key_hash   TEXT NOT NULL,
      label      TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  try { db.exec(`ALTER TABLE alerts ADD COLUMN channel TEXT DEFAULT 'in_app'`); } catch { /* exists */ }
  try { db.exec(`ALTER TABLE alerts ADD COLUMN last_fired TEXT`); } catch { /* exists */ }
}
