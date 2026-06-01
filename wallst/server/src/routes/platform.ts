import { Router, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { authMiddleware } from './auth.js';
import db from '../db/database.js';
import { DEALS_FEED } from '../data/dealsFeed.js';
import { BANKING_REGULATORY, RegulatoryItem } from '../data/bankingRegulatory.js';

const router = Router();
const API = 'https://finnhub.io/api/v1';
const KEY = process.env.FINNHUB_API_KEY ?? '';
const fh = axios.create({ baseURL: API, params: { token: KEY } });

// ── Deals feed (P1) ───────────────────────────────────────────────────────────
router.get('/deals', (_req, res) => {
  res.json(DEALS_FEED);
});

// ── Banking regulatory (P1) ───────────────────────────────────────────────────
router.get('/banking/regulatory', (req, res) => {
  const sym = String(req.query.sym ?? '').toUpperCase();
  const items = sym ? BANKING_REGULATORY.filter((r: RegulatoryItem) => r.sym === sym) : BANKING_REGULATORY;
  res.json(items);
});

// ── FX matrix (P1) ────────────────────────────────────────────────────────────
const FX_PAIRS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD', 'USD/CNH'];
const FX_SYMBOLS: Record<string, string> = {
  'EUR/USD': 'EURUSD', 'GBP/USD': 'GBPUSD', 'USD/JPY': 'USDJPY', 'USD/CHF': 'USDCHF',
  'AUD/USD': 'AUDUSD', 'USD/CAD': 'USDCAD', 'NZD/USD': 'NZDUSD', 'USD/CNH': 'USDCNH',
};
router.get('/fx/matrix', async (_req, res) => {
  try {
    const rows = await Promise.all(
      Object.entries(FX_SYMBOLS).map(async ([pair, sym]) => {
        try {
          const { data } = await fh.get('/quote', { params: { symbol: `OANDA:${sym}` } });
          return { pair, symbol: sym, price: data.c, change: data.dp, high: data.h, low: data.l };
        } catch {
          return { pair, symbol: sym, price: null, change: null, high: null, low: null };
        }
      })
    );
    res.json(rows);
  } catch { res.status(500).json({ error: 'fx matrix failed' }); }
});

// ── Fixed income lite — FRED-style via Finnhub bonds (P1) ─────────────────────
router.get('/fixed-income', async (_req, res) => {
  const TENORS = [
    { label: '2Y', sym: 'US2Y' }, { label: '5Y', sym: 'US5Y' }, { label: '10Y', sym: 'US10Y' },
    { label: '30Y', sym: 'US30Y' }, { label: 'HYG', sym: 'HYG' }, { label: 'LQD', sym: 'LQD' },
    { label: 'TLT', sym: 'TLT' }, { label: 'TIP', sym: 'TIP' },
  ];
  try {
    const rows = await Promise.all(TENORS.map(async t => {
      try {
        const { data } = await fh.get('/quote', { params: { symbol: t.sym } });
        return { ...t, price: data.c, change: data.dp };
      } catch { return { ...t, price: null, change: null }; }
    }));
    res.json(rows);
  } catch { res.status(500).json({ error: 'fixed income failed' }); }
});

// ── News with tags (P0) ───────────────────────────────────────────────────────
router.get('/news/tagged', async (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  const sym = String(req.query.sym ?? '').toUpperCase();
  try {
    let items: any[] = [];
    if (sym) {
      const from = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
      const to = new Date().toISOString().split('T')[0];
      const { data } = await fh.get('/company-news', { params: { symbol: sym, from, to } });
      items = data;
    } else {
      const { data } = await fh.get('/news', { params: { category: 'general' } });
      items = data;
    }
    const tagged = items.map((n: any) => ({
      ...n,
      tags: inferTags(n, sym),
      sentiment: n.sentiment?.bullishPercent != null
        ? (n.sentiment.bullishPercent > 0.55 ? 'BULLISH' : n.sentiment.bullishPercent < 0.45 ? 'BEARISH' : 'NEUTRAL')
        : inferSentiment(n.headline ?? ''),
    }));
    const filtered = q ? tagged.filter((n: any) =>
      n.headline?.toLowerCase().includes(q) || n.summary?.toLowerCase().includes(q)
    ) : tagged;
    res.json(filtered.slice(0, 50));
  } catch { res.status(500).json({ error: 'tagged news failed' }); }
});

function inferTags(n: any, sym: string): string[] {
  const tags: string[] = [];
  const h = (n.headline ?? '').toLowerCase();
  if (sym) tags.push(sym);
  if (h.includes('fed') || h.includes('fomc') || h.includes('rate')) tags.push('MACRO', 'FED');
  if (h.includes('earnings') || h.includes('eps')) tags.push('EARNINGS');
  if (h.includes('merger') || h.includes('acquisition') || h.includes('deal')) tags.push('M&A');
  if (h.includes('bank') || h.includes('credit')) tags.push('BANKING');
  if (tags.length === 0) tags.push('MARKETS');
  return [...new Set(tags)];
}

function inferSentiment(headline: string): string {
  const h = headline.toLowerCase();
  if (/surge|rally|beat|record|soar|jump|gain/.test(h)) return 'BULLISH';
  if (/fall|drop|miss|cut|plunge|warn|crisis/.test(h)) return 'BEARISH';
  return 'NEUTRAL';
}

// ── Equity overview bundle (P0) ───────────────────────────────────────────────
router.get('/equity/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  try {
    const from = new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0];
    const to = new Date().toISOString().split('T')[0];
    const [quote, profile, news, earnings, insider, rec, metrics] = await Promise.allSettled([
      fh.get('/quote', { params: { symbol: sym } }),
      fh.get('/stock/profile2', { params: { symbol: sym } }),
      fh.get('/company-news', { params: { symbol: sym, from, to } }),
      fh.get('/stock/earnings', { params: { symbol: sym, limit: 4 } }),
      fh.get('/stock/insider-transactions', { params: { symbol: sym } }),
      fh.get('/stock/recommendation', { params: { symbol: sym } }),
      fh.get('/stock/metric', { params: { symbol: sym, metric: 'all' } }),
    ]);
    res.json({
      symbol: sym,
      quote: quote.status === 'fulfilled' ? quote.value.data : null,
      profile: profile.status === 'fulfilled' ? profile.value.data : null,
      news: news.status === 'fulfilled' ? (news.value.data ?? []).slice(0, 12) : [],
      earnings: earnings.status === 'fulfilled' ? earnings.value.data : [],
      insider: insider.status === 'fulfilled' ? (insider.value.data?.data ?? []).slice(0, 8) : [],
      recommendations: rec.status === 'fulfilled' ? (rec.value.data ?? []).slice(0, 4) : [],
      metrics: metrics.status === 'fulfilled' ? metrics.value.data?.metric ?? {} : {},
      updatedAt: new Date().toISOString(),
      source: 'Finnhub',
      delayNote: KEY ? 'Live via Finnhub' : 'Configure FINNHUB_API_KEY for live data',
    });
  } catch { res.status(500).json({ error: 'equity overview failed' }); }
});

// ── Calendar ICS export (P0) ──────────────────────────────────────────────────
router.get('/calendar/ics', async (req, res) => {
  const type = String(req.query.type ?? 'economic');
  try {
    let events: { date: string; time?: string; event: string; country?: string }[] = [];
    if (type === 'earnings') {
      const from = new Date().toISOString().split('T')[0];
      const to = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const { data } = await fh.get('/calendar/earnings', { params: { from, to } });
      events = (data.earningsCalendar ?? []).slice(0, 40).map((e: any) => ({
        date: e.date, time: e.hour, event: `${e.symbol} Earnings — EPS est ${e.epsEstimate ?? 'TBD'}`,
      }));
    } else {
      const { data } = await fh.get('/calendar/economic');
      events = (data.economicCalendar ?? []).slice(0, 40).map((e: any) => ({
        date: e.date, time: e.time, event: `${e.event} (${e.country})`, country: e.country,
      }));
    }
    const ics = buildIcs(events);
    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="wallst-${type}.ics"`);
    res.send(ics);
  } catch { res.status(500).json({ error: 'ics export failed' }); }
});

function buildIcs(events: { date: string; time?: string; event: string }[]): string {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//WallSt Watch//EN'];
  events.forEach((e, i) => {
    const d = e.date.replace(/-/g, '');
    lines.push('BEGIN:VEVENT', `UID:ww-${i}-${d}@wallstwatch.com`, `DTSTART;VALUE=DATE:${d}`,
      `SUMMARY:${(e.event ?? '').replace(/,/g, ' ')}`, 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// ── Brief archive (P0) ───────────────────────────────────────────────────────
router.get('/brief/archive', authMiddleware as any, (req: any, res: Response) => {
  const rows = db.prepare('SELECT id,title,created_at FROM brief_archive WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 50')
    .all(req.user.id);
  res.json(rows);
});

router.get('/brief/archive/:id', authMiddleware as any, (req: any, res: Response) => {
  const row = db.prepare('SELECT * FROM brief_archive WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/brief/archive', authMiddleware as any, (req: any, res: Response) => {
  const { title, body } = req.body;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO brief_archive (id,user_id,title,body) VALUES (?,?,?,?)')
    .run(id, req.user.id, title ?? 'Daily Brief', body ?? '');
  res.json({ id });
});

// ── Alert events (in-app) ─────────────────────────────────────────────────────
router.get('/alerts/events', authMiddleware as any, (req: any, res: Response) => {
  const rows = db.prepare(
    'SELECT * FROM alert_events WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
  ).all(req.user.id);
  res.json(rows);
});

router.post('/alerts/events/:id/read', authMiddleware as any, (req: any, res: Response) => {
  db.prepare('UPDATE alert_events SET read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── Saved screener screens (P0) ───────────────────────────────────────────────
router.get('/screens', authMiddleware as any, (req: any, res: Response) => {
  res.json(db.prepare('SELECT * FROM saved_screens WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id));
});

router.post('/screens', authMiddleware as any, (req: any, res: Response) => {
  const { name, filters, symbols } = req.body;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO saved_screens (id,user_id,name,filters,symbols) VALUES (?,?,?,?,?)')
    .run(id, req.user.id, name ?? 'Screen', JSON.stringify(filters ?? {}), JSON.stringify(symbols ?? []));
  res.json(db.prepare('SELECT * FROM saved_screens WHERE id = ?').get(id));
});

router.delete('/screens/:id', authMiddleware as any, (req: any, res: Response) => {
  db.prepare('DELETE FROM saved_screens WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── Terminal layouts (P2) ─────────────────────────────────────────────────────
router.get('/layouts', authMiddleware as any, (req: any, res: Response) => {
  res.json(db.prepare('SELECT * FROM terminal_layouts WHERE user_id = ?').all(req.user.id));
});

router.post('/layouts', authMiddleware as any, (req: any, res: Response) => {
  const { name, panels } = req.body;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO terminal_layouts (id,user_id,name,panels) VALUES (?,?,?,?)')
    .run(id, req.user.id, name ?? 'Layout', JSON.stringify(panels ?? []));
  res.json(db.prepare('SELECT * FROM terminal_layouts WHERE id = ?').get(id));
});

router.delete('/layouts/:id', authMiddleware as any, (req: any, res: Response) => {
  db.prepare('DELETE FROM terminal_layouts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ ok: true });
});

// ── Teams (P2) ────────────────────────────────────────────────────────────────
router.get('/teams', authMiddleware as any, (req: any, res: Response) => {
  const teams = db.prepare(`
    SELECT t.* FROM teams t
    JOIN team_members m ON m.team_id = t.id
    WHERE m.user_id = ?
  `).all(req.user.id);
  res.json(teams);
});

router.post('/teams', authMiddleware as any, (req: any, res: Response) => {
  const { name } = req.body;
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO teams (id,owner_id,name) VALUES (?,?,?)').run(id, req.user.id, name ?? 'Team');
  db.prepare('INSERT INTO team_members (team_id,user_id,role) VALUES (?,?,?)').run(id, req.user.id, 'owner');
  res.json(db.prepare('SELECT * FROM teams WHERE id = ?').get(id));
});

router.get('/teams/:id/watchlist', authMiddleware as any, (req: any, res: Response) => {
  const member = db.prepare('SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!member) return res.status(403).json({ error: 'Not a team member' });
  res.json(db.prepare('SELECT * FROM team_watchlists WHERE team_id = ?').all(req.params.id));
});

router.post('/teams/:id/watchlist', authMiddleware as any, (req: any, res: Response) => {
  const { symbol, notes } = req.body;
  const sym = String(symbol ?? '').toUpperCase();
  db.prepare('INSERT OR REPLACE INTO team_watchlists (team_id,symbol,added_by,notes) VALUES (?,?,?,?)')
    .run(req.params.id, sym, req.user.id, notes ?? '');
  res.json(db.prepare('SELECT * FROM team_watchlists WHERE team_id = ?').all(req.params.id));
});

// ── Slack webhook (P2) ────────────────────────────────────────────────────────
router.post('/slack/webhook', authMiddleware as any, (req: any, res: Response) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });
  db.prepare('INSERT OR REPLACE INTO slack_webhooks (user_id,url) VALUES (?,?)').run(req.user.id, url);
  res.json({ ok: true });
});

// ── Institutional CSV export API (P2) ─────────────────────────────────────────
router.get('/export/quotes.csv', authMiddleware as any, async (req: any, res: Response) => {
  const user = db.prepare('SELECT plan FROM users WHERE id = ?').get(req.user.id) as { plan: string };
  if (!['institutional', 'professional'].includes(user?.plan ?? '') && process.env.UNLOCK_ALL !== 'true') {
    return res.status(403).json({ error: 'Professional or Institutional plan required' });
  }
  const symbols = String(req.query.symbols ?? 'JPM,GS,AAPL,MSFT,NVDA').split(',');
  const rows = ['symbol,price,change_pct,high,low,open,prev_close'];
  for (const s of symbols) {
    try {
      const { data } = await fh.get('/quote', { params: { symbol: s.trim() } });
      rows.push(`${s},${data.c},${data.dp},${data.h},${data.l},${data.o},${data.pc}`);
    } catch { rows.push(`${s},,,,,,`); }
  }
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="quotes.csv"');
  res.send(rows.join('\n'));
});

// ── PDF report text (P2) — returns markdown for client print/PDF ───────────────
router.post('/reports/generate', authMiddleware as any, async (req: any, res: Response) => {
  const { symbol, type } = req.body;
  const sym = String(symbol ?? 'JPM').toUpperCase();
  try {
    const { data: profile } = await fh.get('/stock/profile2', { params: { symbol: sym } });
    const { data: quote } = await fh.get('/quote', { params: { symbol: sym } });
    const md = `# WALLST WATCH — ${type ?? 'Equity'} Report\n**${sym}** · ${profile.name ?? sym}\n\nGenerated ${new Date().toISOString()}\n\n## Price\n$${quote.c?.toFixed(2) ?? 'N/A'} (${quote.dp >= 0 ? '+' : ''}${quote.dp?.toFixed(2) ?? 0}%)\n\n## Profile\n- Industry: ${profile.finnhubIndustry ?? 'N/A'}\n- Market Cap: $${profile.marketCapitalization ? (profile.marketCapitalization / 1000).toFixed(1) + 'B' : 'N/A'}\n- Exchange: ${profile.exchange ?? 'N/A'}\n\n---\n*WallSt Watch — Not investment advice.*`;
    res.json({ markdown: md, symbol: sym });
  } catch { res.status(500).json({ error: 'report failed' }); }
});

// ── Options unusual activity from chain (P1) ──────────────────────────────────
router.get('/options-flow/:symbol', async (req, res) => {
  const sym = req.params.symbol.toUpperCase();
  try {
    const { data } = await fh.get('/stock/option-chain', { params: { symbol: sym } });
    const calls = (data.data ?? []).filter((o: any) => o.type === 'call' || o.optionType === 'call');
    const puts = (data.data ?? []).filter((o: any) => o.type === 'put' || o.optionType === 'put');
    const unusual = [...calls, ...puts]
      .filter((o: any) => (o.volume ?? 0) > 500)
      .sort((a: any, b: any) => (b.volume ?? 0) - (a.volume ?? 0))
      .slice(0, 25)
      .map((o: any) => ({
        sym,
        type: (o.type ?? o.optionType ?? 'CALL').toUpperCase(),
        strike: o.strike ?? o.strikePrice,
        expiry: o.expiration ?? o.expireDate,
        volume: o.volume ?? 0,
        openInterest: o.openInterest ?? 0,
        iv: o.impliedVolatility ?? null,
        premium: ((o.lastPrice ?? o.last ?? 0) * (o.volume ?? 0) * 100).toFixed(0),
      }));
    res.json({ flow: unusual, simulated: unusual.length === 0 });
  } catch {
    res.json({ flow: [], simulated: true, error: 'options data unavailable' });
  }
});

export default router;
