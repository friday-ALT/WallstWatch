import axios from 'axios';
import crypto from 'crypto';
import db from '../db/database.js';
import { sendPushToUser } from './pushNotifications.js';

const API = 'https://finnhub.io/api/v1';
const KEY = process.env.FINNHUB_API_KEY ?? '';
const fh = axios.create({ baseURL: API, params: { token: KEY }, timeout: 12_000 });

const BANKING_RE =
  /\b(jpm|jp\s*morgan|goldman|gs|morgan\s*stanley|bank\s*of\s*america|bac|citi|wells\s*fargo|fed|fomc|rate\s*cut|inflation|treasury|yield|banking|credit|earnings|wall\s*street|s&p|nasdaq|dow)\b/i;

let lastGeneralPoll = 0;
let seenHeadlines = new Set<string>();

function headlineHash(headline: string): string {
  return crypto.createHash('sha256').update(headline.trim().toLowerCase()).digest('hex').slice(0, 16);
}

function alreadySentToUser(userId: string, hash: string): boolean {
  return !!db.prepare(
    `SELECT id FROM news_push_sent WHERE user_id = ? AND headline_hash = ?`
  ).get(userId, hash);
}

function recentNewsPushCount(userId: string): number {
  const row = db.prepare(
    `SELECT COUNT(*) as c FROM news_push_sent WHERE user_id = ? AND created_at > datetime('now', '-1 hour')`
  ).get(userId) as { c: number };
  return row?.c ?? 0;
}

function lastNewsPushAt(userId: string): string | null {
  const row = db.prepare(
    `SELECT created_at FROM news_push_sent WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`
  ).get(userId) as { created_at: string } | undefined;
  return row?.created_at ?? null;
}

function minutesSince(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 60_000;
}

function matchesInterest(headline: string, symbols: string[]): boolean {
  if (BANKING_RE.test(headline)) return true;
  const upper = headline.toUpperCase();
  return symbols.some((sym) => upper.includes(sym));
}

interface NewsItem {
  headline: string;
  source: string;
  datetime: number;
  url?: string;
}

async function fetchGeneralNews(): Promise<NewsItem[]> {
  const { data } = await fh.get('/news', { params: { category: 'general' } });
  return (data ?? []).slice(0, 20) as NewsItem[];
}

async function fetchSymbolNews(symbol: string): Promise<NewsItem[]> {
  const from = new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0];
  const to = new Date().toISOString().split('T')[0];
  const { data } = await fh.get('/company-news', { params: { symbol, from, to } });
  return (data ?? []).slice(0, 5) as NewsItem[];
}

function recordSent(userId: string, hash: string) {
  db.prepare(
    'INSERT INTO news_push_sent (id, user_id, headline_hash, created_at) VALUES (?,?,?,?)'
  ).run(`${Date.now()}-${hash.slice(0, 8)}`, userId, hash, new Date().toISOString());
}

async function pushNewsToUser(userId: string, item: NewsItem) {
  const hash = headlineHash(item.headline);
  if (alreadySentToUser(userId, hash)) return false;
  if (recentNewsPushCount(userId) >= 6) return false;
  const lastAt = lastNewsPushAt(userId);
  if (lastAt && minutesSince(lastAt) < 10) return false;

  await sendPushToUser(userId, 'news', {
    title: `◆ ${item.source}`,
    body: item.headline,
    data: {
      type: 'news',
      url: item.url ?? '',
      headline: item.headline,
    },
  });
  recordSent(userId, hash);
  return true;
}

export async function runNewsAlertEngine() {
  if (!KEY) return;
  const now = Date.now();
  if (now - lastGeneralPoll < 4 * 60_000) return;
  lastGeneralPoll = now;

  let generalNews: NewsItem[] = [];
  try {
    generalNews = await fetchGeneralNews();
  } catch {
    return;
  }

  const freshGeneral = generalNews.filter((n) => {
    const hash = headlineHash(n.headline);
    if (seenHeadlines.has(hash)) return false;
    seenHeadlines.add(hash);
    return n.datetime * 1000 > now - 30 * 60_000;
  });
  if (seenHeadlines.size > 500) {
    seenHeadlines = new Set([...seenHeadlines].slice(-200));
  }

  const users = db.prepare(`
    SELECT u.id FROM users u
    WHERE u.push_news_alerts = 1
      AND EXISTS (SELECT 1 FROM push_tokens pt WHERE pt.user_id = u.id)
  `).all() as { id: string }[];

  for (const { id: userId } of users) {
    const watchlist = db.prepare('SELECT symbol FROM watchlist WHERE user_id = ?').all(userId) as { symbol: string }[];
    const symbols = watchlist.map((w) => w.symbol.toUpperCase());

    for (const item of freshGeneral) {
      const isTopHeadline = freshGeneral.indexOf(item) < 2;
      if (!isTopHeadline && !matchesInterest(item.headline, symbols)) continue;
      const sent = await pushNewsToUser(userId, item);
      if (sent) break;
    }

    for (const sym of symbols.slice(0, 8)) {
      try {
        const companyNews = await fetchSymbolNews(sym);
        for (const item of companyNews) {
          if (item.datetime * 1000 < now - 60 * 60_000) continue;
          const sent = await pushNewsToUser(userId, item);
          if (sent) break;
        }
      } catch {
        /* rate limit or network — skip symbol */
      }
    }
  }
}
