import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import Stripe from 'stripe';
import authRouter, { authMiddleware } from './routes/auth.js';
import platformRouter from './routes/platform.js';
import db from './db/database.js';
import { runMigrations } from './db/migrations.js';
import { startDailyBriefScheduler, sendDailyBrief } from './dailyBrief.js';
import { seedDemoUser } from './demoUser.js';
import { runAlertEngine } from './services/alertEngine.js';
import { getQuote, getQuotes, refreshQuoteCache, getCachedQuotes, type Quote } from './services/quotes.js';
import { QUOTE_UNIVERSE } from './services/quoteSymbols.js';

dotenv.config();
runMigrations();

const app = express();
app.use(cors());
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Root: API only (frontend is on Vercel). Helps verify Railway root = wallst/server.
app.get('/', (_req, res) => {
  res.json({
    service: 'wallst-watch-api',
    version: '1',
    docs: 'Use /api/news, /api/auth, etc. Deploy the React app separately (wallst/website).',
  });
});
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'wallst-watch-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/platform', platformRouter);

const API = 'https://finnhub.io/api/v1';
const KEY = process.env.FINNHUB_API_KEY ?? '';
const fh = axios.create({ baseURL: API, params: { token: KEY } });

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any })
  : null;

// ── Quotes (Finnhub + Yahoo fallback, shared cache) ───────────────────────────
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const q = await getQuote(req.params.symbol.toUpperCase());
    if (!q) return res.status(404).json({ error: 'quote unavailable' });
    res.json(q);
  } catch { res.status(500).json({ error: 'quote failed' }); }
});

app.get('/api/quotes', async (req, res) => {
  const symbols = String(req.query.symbols ?? '').split(',').filter(Boolean);
  if (symbols.length === 0) return res.json({});
  try {
    const record = await getQuotes(symbols);
    res.json(record);
  } catch {
    const fallback: Record<string, Quote> = {};
    const cached = getCachedQuotes();
    for (const s of symbols) {
      const sym = s.toUpperCase();
      if (cached[sym]) fallback[sym] = cached[sym];
    }
    res.json(fallback);
  }
});

// ── News ──────────────────────────────────────────────────────────────────────
app.get('/api/news', async (req, res) => {
  try {
    const { data } = await fh.get('/news', { params: { category: 'general' } });
    res.json(data.slice(0, 20));
  } catch { res.status(500).json({ error: 'news failed' }); }
});

app.get('/api/news/:symbol', async (req, res) => {
  const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const to   = new Date().toISOString().split('T')[0];
  try {
    const { data } = await fh.get('/company-news', { params: { symbol: req.params.symbol.toUpperCase(), from, to } });
    res.json(data.slice(0, 10));
  } catch { res.status(500).json({ error: 'company news failed' }); }
});

// News search (keyword across general + company news)
app.get('/api/search/news', async (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  const sym = String(req.query.sym ?? '');
  try {
    let items: any[] = [];
    if (sym) {
      const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const to   = new Date().toISOString().split('T')[0];
      const { data } = await fh.get('/company-news', { params: { symbol: sym.toUpperCase(), from, to } });
      items = data;
    } else {
      const { data } = await fh.get('/news', { params: { category: 'general' } });
      items = data;
    }
    const filtered = q ? items.filter((n: any) =>
      n.headline?.toLowerCase().includes(q) || n.summary?.toLowerCase().includes(q)
    ) : items;
    res.json(filtered.slice(0, 40));
  } catch { res.status(500).json({ error: 'news search failed' }); }
});

// ── Candle history ────────────────────────────────────────────────────────────
app.get('/api/candles/:symbol', async (req, res) => {
  const resolution = String(req.query.resolution ?? 'D');
  const days = Number(req.query.days ?? 30);
  const to   = Math.floor(Date.now() / 1000);
  const from = to - days * 86400;
  try {
    const { data } = await fh.get('/stock/candle', {
      params: { symbol: req.params.symbol.toUpperCase(), resolution, from, to }
    });
    res.json(data);
  } catch { res.status(500).json({ error: 'candles failed' }); }
});

// ── Earnings Calendar ─────────────────────────────────────────────────────────
app.get('/api/earnings', async (req, res) => {
  const from = String(req.query.from ?? new Date().toISOString().split('T')[0]);
  const to   = String(req.query.to   ?? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  try {
    const { data } = await fh.get('/calendar/earnings', { params: { from, to } });
    res.json(data.earningsCalendar ?? []);
  } catch { res.status(500).json({ error: 'earnings failed' }); }
});

// Earnings beat/miss history for a symbol
app.get('/api/earnings/history/:symbol', async (req, res) => {
  try {
    const { data } = await fh.get('/stock/earnings', { params: { symbol: req.params.symbol.toUpperCase(), limit: 12 } });
    res.json(data ?? []);
  } catch { res.status(500).json({ error: 'earnings history failed' }); }
});

// ── Insider Transactions ──────────────────────────────────────────────────────
app.get('/api/insider/:symbol', async (req, res) => {
  try {
    const { data } = await fh.get('/stock/insider-transactions', { params: { symbol: req.params.symbol.toUpperCase() } });
    res.json((data.data ?? []).slice(0, 30));
  } catch { res.status(500).json({ error: 'insider failed' }); }
});

// ── Options Chain ─────────────────────────────────────────────────────────────
app.get('/api/options/:symbol', async (req, res) => {
  const date = String(req.query.date ?? '');
  try {
    const params: any = { symbol: req.params.symbol.toUpperCase() };
    if (date) params.date = date;
    const { data } = await fh.get('/stock/option-chain', { params });
    res.json(data);
  } catch { res.status(500).json({ error: 'options chain failed' }); }
});

// ── Dividends ─────────────────────────────────────────────────────────────────
app.get('/api/dividends/:symbol', async (req, res) => {
  const from = new Date(Date.now() - 365 * 86400000).toISOString().split('T')[0];
  const to   = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];
  try {
    const { data } = await fh.get('/stock/dividend2', { params: { symbol: req.params.symbol.toUpperCase() } });
    res.json(data.data ?? data ?? []);
  } catch { res.status(500).json({ error: 'dividends failed' }); }
});

// ── Economic Calendar ─────────────────────────────────────────────────────────
app.get('/api/economic-calendar', async (req, res) => {
  try {
    const { data } = await fh.get('/calendar/economic');
    res.json((data.economicCalendar ?? []).slice(0, 50));
  } catch { res.status(500).json({ error: 'economic calendar failed' }); }
});

// ── Company Profile + Metrics ─────────────────────────────────────────────────
app.get('/api/profile/:symbol', async (req, res) => {
  try {
    const [profile, metrics] = await Promise.all([
      fh.get('/stock/profile2', { params: { symbol: req.params.symbol.toUpperCase() } }),
      fh.get('/stock/metric',   { params: { symbol: req.params.symbol.toUpperCase(), metric: 'all' } }),
    ]);
    res.json({ ...profile.data, metrics: metrics.data.metric ?? {} });
  } catch { res.status(500).json({ error: 'profile failed' }); }
});

// ── Recommendation ────────────────────────────────────────────────────────────
app.get('/api/recommendation/:symbol', async (req, res) => {
  try {
    const { data } = await fh.get('/stock/recommendation', { params: { symbol: req.params.symbol.toUpperCase() } });
    res.json(data.slice(0, 6));
  } catch { res.status(500).json({ error: 'recommendation failed' }); }
});

// ── Financials ────────────────────────────────────────────────────────────────
app.get('/api/financials/:symbol', async (req, res) => {
  try {
    const { data } = await fh.get('/stock/metric', { params: { symbol: req.params.symbol.toUpperCase(), metric: 'all' } });
    res.json(data);
  } catch { res.status(500).json({ error: 'financials failed' }); }
});

// ── Options sentiment proxy ───────────────────────────────────────────────────
app.get('/api/options-sentiment/:symbol', async (req, res) => {
  try {
    const [sentiment, rec] = await Promise.all([
      fh.get('/news-sentiment', { params: { symbol: req.params.symbol.toUpperCase() } }),
      fh.get('/stock/recommendation', { params: { symbol: req.params.symbol.toUpperCase() } }),
    ]);
    res.json({ sentiment: sentiment.data, recommendation: rec.data.slice(0, 3) });
  } catch { res.status(500).json({ error: 'options sentiment failed' }); }
});

// ── Screener ──────────────────────────────────────────────────────────────────
app.get('/api/screener', async (req, res) => {
  const symbols = String(req.query.symbols ?? 'JPM,GS,MS,BAC,C,WFC,AAPL,MSFT,GOOGL,NVDA,XOM,CVX,JNJ,PFE,UNH').split(',');
  try {
    const results = await Promise.all(symbols.map(async (s) => {
      try {
        const [q, m] = await Promise.all([
          fh.get('/quote',         { params: { symbol: s } }),
          fh.get('/stock/metric',  { params: { symbol: s, metric: 'all' } }),
        ]);
        return { symbol: s, quote: q.data, metrics: m.data.metric ?? {} };
      } catch { return { symbol: s, quote: null, metrics: {} }; }
    }));
    res.json(results);
  } catch { res.status(500).json({ error: 'screener failed' }); }
});

// ── AI Research (Claude) ──────────────────────────────────────────────────────
app.post('/api/ai/research', authMiddleware as any, async (req: any, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({ error: 'AI service not configured. Add ANTHROPIC_API_KEY to .env' });
  }
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });
  try {
    const sym = symbol.toUpperCase();
    const [profileRes, newsRes, earningsRes, metricsRes] = await Promise.allSettled([
      fh.get('/stock/profile2',   { params: { symbol: sym } }),
      fh.get('/company-news',     { params: { symbol: sym, from: new Date(Date.now()-14*86400000).toISOString().slice(0,10), to: new Date().toISOString().slice(0,10) } }),
      fh.get('/stock/earnings',   { params: { symbol: sym, limit: 4 } }),
      fh.get('/stock/metric',     { params: { symbol: sym, metric: 'all' } }),
    ]);
    const profile  = profileRes.status === 'fulfilled'  ? profileRes.value.data   : {};
    const news     = newsRes.status === 'fulfilled'     ? newsRes.value.data.slice(0,5) : [];
    const earnings = earningsRes.status === 'fulfilled' ? earningsRes.value.data  : [];
    const metrics  = metricsRes.status === 'fulfilled'  ? metricsRes.value.data.metric ?? {} : {};

    const newsLines = news.map((n: any) => `- ${n.headline}`).join('\n');
    const earningsLines = (Array.isArray(earnings) ? earnings : []).slice(0,4).map((e: any) =>
      `Q${e.period}: EPS ${e.actual ?? '?'} vs est ${e.estimate ?? '?'} (${e.actual != null && e.estimate != null ? (e.actual >= e.estimate ? 'BEAT' : 'MISS') : 'N/A'})`
    ).join('\n');

    const prompt = `You are a senior Wall Street equity analyst at a top-tier investment bank. Write a rigorous, institutional-grade research note for ${sym} (${profile.name ?? sym}).

Company context:
- Industry: ${profile.finnhubIndustry ?? 'N/A'}
- Market Cap: $${profile.marketCapitalization ? (profile.marketCapitalization/1000).toFixed(1)+'B' : 'N/A'}
- 52W High: ${metrics['52WeekHigh'] ?? 'N/A'}, 52W Low: ${metrics['52WeekLow'] ?? 'N/A'}
- P/E: ${metrics.peBasicExclExtraTTM ?? 'N/A'}, P/B: ${metrics.pbAnnual ?? 'N/A'}
- ROE: ${metrics.roeTTM ?? 'N/A'}%, ROA: ${metrics.roaTTM ?? 'N/A'}%
- Debt/Equity: ${metrics.totalDebt_totalEquityAnnual ?? 'N/A'}

Recent earnings (last 4 quarters):
${earningsLines || 'Not available'}

Recent news headlines:
${newsLines || 'No recent news'}

Write a structured analyst note with these sections (use markdown bold for headers):
**INVESTMENT THESIS** — Core bull/bear case in 2-3 sentences
**KEY CATALYSTS** — 3 specific near-term and medium-term catalysts
**RISK FACTORS** — 3 material risks with probability assessment
**VALUATION** — Commentary on current multiples vs peers and history
**TECHNICAL LEVELS** — Key support/resistance levels from the 52W range
**CONCLUSION & RATING** — BUY/HOLD/SELL with 12-month price target rationale

Be specific, quantitative where possible, and write in the voice of a Goldman Sachs equity research note. Do not use generic filler language.`;

    const message = await claude.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const citations = [
      ...news.slice(0, 5).map((n: any) => ({ type: 'news', title: n.headline, url: n.url, source: n.source })),
      { type: 'data', title: 'Finnhub company profile & metrics', url: `https://finnhub.io`, source: 'Finnhub' },
      { type: 'data', title: 'Earnings history', url: `https://finnhub.io/stock/${sym}/earnings`, source: 'Finnhub' },
    ].filter(c => c.title);
    res.json({ text, symbol: sym, citations, generatedAt: new Date().toISOString(), model: 'claude-opus-4-5' });
  } catch (e: any) {
    console.error('AI research error:', e.message);
    res.status(500).json({ error: e.message ?? 'AI generation failed' });
  }
});

// ── Yield Curve ───────────────────────────────────────────────────────────────
// Real rates from FRED via Finnhub economic calendar + static recent values
app.get('/api/yield-curve', async (_req, res) => {
  const TENORS = [
    { label: '3M', symbol: 'US03MY' },
    { label: '6M', symbol: 'US06MY' },
    { label: '1Y', symbol: 'US1Y'   },
    { label: '2Y', symbol: 'US2Y'   },
    { label: '5Y', symbol: 'US5Y'   },
    { label: '10Y', symbol: 'US10Y' },
    { label: '20Y', symbol: 'US20Y' },
    { label: '30Y', symbol: 'US30Y' },
  ];
  try {
    const results = await Promise.all(TENORS.map(async (t) => {
      try {
        const { data } = await fh.get('/quote', { params: { symbol: t.symbol } });
        return { ...t, yield: data.c ?? null, prevYield: data.pc ?? null };
      } catch { return { ...t, yield: null, prevYield: null }; }
    }));
    res.json(results);
  } catch { res.status(500).json({ error: 'yield curve failed' }); }
});

// ── Correlation data (candles for multiple symbols) ───────────────────────────
app.post('/api/correlation', async (req, res) => {
  const { symbols } = req.body as { symbols: string[] };
  if (!symbols?.length) return res.status(400).json({ error: 'symbols required' });
  const to   = Math.floor(Date.now() / 1000);
  const from = to - 30 * 86400;
  try {
    const results = await Promise.all(symbols.map(async (s) => {
      try {
        const { data } = await fh.get('/stock/candle', { params: { symbol: s, resolution: 'D', from, to } });
        return { symbol: s, closes: data.c ?? [] };
      } catch { return { symbol: s, closes: [] }; }
    }));
    res.json(results);
  } catch { res.status(500).json({ error: 'correlation data failed' }); }
});

// ── Sector ETF quotes for rotation ───────────────────────────────────────────
app.get('/api/sectors', async (_req, res) => {
  const SECTORS = ['XLF','XLK','XLE','XLV','XLI','XLY','XLP','XLU','XLRE','XLB','XLC'];
  try {
    const results = await Promise.all(SECTORS.map(async (s) => {
      const { data } = await fh.get('/quote', { params: { symbol: s } });
      return { symbol: s, ...data };
    }));
    res.json(results);
  } catch { res.status(500).json({ error: 'sectors failed' }); }
});

// ── Stripe ────────────────────────────────────────────────────────────────────
app.post('/api/stripe/checkout', authMiddleware as any, async (req: any, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });
  const { plan } = req.body;
  const priceId = plan === 'professional' ? process.env.STRIPE_PRICE_PROFESSIONAL : process.env.STRIPE_PRICE_PRO;
  if (!priceId) return res.status(400).json({ error: 'Price ID not configured' });
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      automatic_tax: { enabled: true },
      billing_address_collection: 'required',
      customer_email: req.user.email,
      success_url: `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/dashboard?upgraded=1`,
      cancel_url:  `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/pricing`,
      metadata: { userId: req.user.id, plan },
    });
    res.json({ url: session.url });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.post('/api/stripe/webhook', async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.json({ received: true });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'] as string, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e: any) { return res.status(400).json({ error: e.message }); }
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    const userId = s.metadata?.userId;
    const plan   = s.metadata?.plan ?? 'pro';
    if (userId) db.prepare('UPDATE users SET plan = ?, trial_ends = NULL WHERE id = ?').run(plan, userId);
  }
  res.json({ received: true });
});

// ── Daily brief preferences ────────────────────────────────────────────────────
app.post('/api/brief/subscribe', authMiddleware as any, (req: any, res) => {
  db.prepare('UPDATE users SET daily_brief_email = ? WHERE id = ?').run(1, req.user.id);
  res.json({ subscribed: true });
});

app.post('/api/brief/unsubscribe', authMiddleware as any, (req: any, res) => {
  db.prepare('UPDATE users SET daily_brief_email = ? WHERE id = ?').run(0, req.user.id);
  res.json({ subscribed: false });
});

// Unsubscribe via link in email (no auth — uses base64 user id token)
app.get('/api/brief/unsubscribe-link', (req, res) => {
  const token = String(req.query.token ?? '');
  if (!token) return res.status(400).json({ error: 'Missing token' });
  try {
    const userId = Buffer.from(token, 'base64url').toString('utf8');
    db.prepare('UPDATE users SET daily_brief_email = 0 WHERE id = ?').run(userId);
    res.json({ ok: true, message: 'Unsubscribed from daily morning brief.' });
  } catch { res.status(400).json({ error: 'Invalid token' }); }
});

// Manual trigger for testing (remove or guard in production)
app.post('/api/brief/send-now', authMiddleware as any, async (_req: any, res) => {
  res.json({ ok: true, message: 'Brief generation started — check server logs.' });
  sendDailyBrief().catch(console.error);
});

// ── HTTP server + WebSocket ───────────────────────────────────────────────────
const server = createServer(app);
const wss = new WebSocketServer({ server });

async function refreshPrices() {
  try {
    await refreshQuoteCache(QUOTE_UNIVERSE);
    const priceCache = getCachedQuotes();
    if (Object.keys(priceCache).length === 0) return;
    const msg = JSON.stringify({ type: 'prices', data: priceCache });
    wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(msg); });
  } catch { /* silent */ }
}

refreshPrices().catch(() => {});
setInterval(refreshPrices, 15_000);
setInterval(() => { runAlertEngine().catch(() => {}); }, 60_000);
wss.on('connection', (ws) => {
  const cached = getCachedQuotes();
  if (Object.keys(cached).length > 0) ws.send(JSON.stringify({ type: 'prices', data: cached }));
});

const PORT = Number(process.env.PORT ?? 3001);
server.listen(PORT, () => {
  console.log(`◆ WallSt Watch server on http://localhost:${PORT}`);
  seedDemoUser();
  startDailyBriefScheduler();
});
