import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'wallst.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id                 TEXT PRIMARY KEY,
    email              TEXT UNIQUE NOT NULL,
    password_hash      TEXT NOT NULL,
    name               TEXT NOT NULL,
    plan               TEXT NOT NULL DEFAULT 'free',
    trial_ends         TEXT,
    created_at         TEXT NOT NULL,
    daily_brief_email  INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS watchlist (
    user_id   TEXT NOT NULL,
    symbol    TEXT NOT NULL,
    target    REAL,
    conviction TEXT,
    notes     TEXT,
    added_at  TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, symbol)
  );
  CREATE TABLE IF NOT EXISTS portfolio (
    user_id  TEXT NOT NULL,
    symbol   TEXT NOT NULL,
    shares   REAL NOT NULL,
    avg_cost REAL NOT NULL,
    PRIMARY KEY (user_id, symbol)
  );
  CREATE TABLE IF NOT EXISTS alerts (
    id        TEXT PRIMARY KEY,
    user_id   TEXT NOT NULL,
    symbol    TEXT NOT NULL,
    type      TEXT NOT NULL,
    threshold TEXT NOT NULL,
    active    INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS analytics (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  TEXT,
    tab      TEXT NOT NULL,
    ts       TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Migrations — safe to run repeatedly
try { db.exec(`ALTER TABLE users ADD COLUMN daily_brief_email INTEGER NOT NULL DEFAULT 1`); } catch { /* column already exists */ }

export default db;
