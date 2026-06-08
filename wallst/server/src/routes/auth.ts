import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import db from '../db/database.js';
import { registerPushToken, removePushToken } from '../services/pushNotifications.js';

const SIGNUP_WATCHLIST = ['SPY', 'QQQ', 'JPM', 'GS', 'NVDA', 'XLF'];

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'wallst-watch-secret-CHANGE-IN-PROD';
const TRIAL_DAYS = 14;

interface DBUser {
  id: string; email: string; password_hash: string; name: string;
  plan: string; trial_ends: string | null; created_at: string;
  push_price_alerts?: number; push_news_alerts?: number;
}

function makeToken(user: DBUser) {
  return jwt.sign({ id: user.id, email: user.email, plan: user.plan }, JWT_SECRET, { expiresIn: '30d' });
}

function effectivePlan(user: DBUser): string {
  if (user.trial_ends && new Date(user.trial_ends) > new Date()) return 'pro';
  return user.plan;
}

function safeUser(user: DBUser) {
  const plan = effectivePlan(user);
  const trialActive = !!(user.trial_ends && new Date(user.trial_ends) > new Date());
  const trialDaysLeft = trialActive
    ? Math.ceil((new Date(user.trial_ends!).getTime() - Date.now()) / 86400000)
    : 0;
  const { password_hash, ...safe } = user;
  return {
    ...safe,
    plan,
    trialActive,
    trialDaysLeft,
    pushPriceAlerts: (user.push_price_alerts ?? 1) === 1,
    pushNewsAlerts: (user.push_news_alerts ?? 1) === 1,
  };
}

async function sendWelcomeEmail(to: string, name: string) {
  const user = process.env.NODEMAILER_USER;
  const pass = process.env.NODEMAILER_PASS;
  if (!user || !pass) return;
  try {
    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    await transporter.sendMail({
      from: `"WALLST WATCH" <${user}>`,
      to,
      subject: '◆ Welcome to WALLST WATCH — Your 14-Day Pro Trial Has Started',
      html: `
        <div style="font-family:monospace;background:#0a0c0f;color:#e8ecf0;padding:40px;max-width:600px;margin:0 auto">
          <div style="font-size:24px;font-weight:700;letter-spacing:4px;color:#ff3b3b;margin-bottom:8px">◆ WALLST WATCH</div>
          <div style="font-size:11px;color:#4a5568;letter-spacing:3px;margin-bottom:32px">BANKING COMMAND CENTER</div>
          <div style="font-size:18px;font-weight:700;color:#e8ecf0;margin-bottom:16px">Welcome, ${name}.</div>
          <p style="font-size:13px;color:#8b95a5;line-height:1.8">Your 14-day Pro trial is now active. You have full access to every feature — AI Research, PDF Export, Unlimited Alerts, Portfolio Tracker, Dark Pool data, and more.</p>
          <div style="margin:28px 0;padding:20px;background:#141820;border:1px solid #2a3040;border-left:3px solid #ff3b3b">
            <div style="font-size:10px;font-weight:700;color:#ff3b3b;letter-spacing:2px;margin-bottom:12px">WHAT'S INCLUDED IN YOUR TRIAL</div>
            ${['◆ AI-powered Research Notes (Claude)', '◆ PDF Export of Daily Brief & Research', '◆ Unlimited Price & Earnings Alerts', '◆ Full Portfolio Tracker with P&L', '◆ Dark Pool & Short Interest Data', '◆ Yield Curve & Correlation Matrix'].map(f => `<div style="font-size:11px;color:#8b95a5;padding:3px 0">${f}</div>`).join('')}
          </div>
          <a href="${process.env.CLIENT_URL ?? 'http://localhost:5173'}/dashboard" style="display:inline-block;background:#ff3b3b;color:#fff;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:1px;padding:12px 24px;text-decoration:none;border-radius:2px">LAUNCH COMMAND CENTER →</a>
          <p style="font-size:10px;color:#4a5568;margin-top:28px">After 14 days, your trial converts to a Free plan unless you upgrade. Pro is $29/month — less than a Bloomberg data terminal per day.</p>
        </div>`,
    });
  } catch (e) { /* non-fatal */ }
}

export function authMiddleware(req: any, res: Response, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

export function requirePlan(...plans: string[]) {
  return (req: any, res: Response, next: any) => {
    authMiddleware(req, res, () => {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as DBUser | undefined;
      if (!user) return res.status(404).json({ error: 'User not found' });
      const plan = effectivePlan(user);
      if (plans.includes(plan)) return next();
      res.status(403).json({ error: 'Upgrade required', requiredPlan: plans[0] });
    });
  };
}

router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'Email already registered' });
  const trialEnds = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
  const user: DBUser = {
    id: Date.now().toString(), email, name,
    password_hash: await bcrypt.hash(password, 10),
    plan: 'free', trial_ends: trialEnds,
    created_at: new Date().toISOString(),
  };
  db.prepare('INSERT INTO users (id,email,password_hash,name,plan,trial_ends,created_at) VALUES (?,?,?,?,?,?,?)')
    .run(user.id, user.email, user.password_hash, user.name, user.plan, user.trial_ends, user.created_at);
  for (const sym of SIGNUP_WATCHLIST) {
    db.prepare('INSERT INTO watchlist (user_id,symbol,conviction,notes,added_at) VALUES (?,?,?,?,?)')
      .run(user.id, sym, 'NEUTRAL', 'Default watchlist', user.created_at);
  }
  sendWelcomeEmail(email, name);
  res.json({ token: makeToken(user), user: safeUser(user) });
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as DBUser | undefined;
  if (!user || !(await bcrypt.compare(password, user.password_hash)))
    return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ token: makeToken(user), user: safeUser(user) });
});

router.get('/me', authMiddleware, (req: any, res: Response) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as DBUser | undefined;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(safeUser(user));
});

// Watchlist
router.get('/watchlist', authMiddleware, (req: any, res: Response) => {
  res.json(db.prepare('SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC').all(req.user.id));
});
router.post('/watchlist', authMiddleware, (req: any, res: Response) => {
  const { symbol, target, conviction, notes } = req.body;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });
  const sym = symbol.toUpperCase();
  db.prepare('INSERT OR REPLACE INTO watchlist (user_id,symbol,target,conviction,notes,added_at) VALUES (?,?,?,?,?,?)')
    .run(req.user.id, sym, target ?? null, conviction ?? 'NEUTRAL', notes ?? '', new Date().toISOString());
  res.json(db.prepare('SELECT * FROM watchlist WHERE user_id = ?').all(req.user.id));
});
router.delete('/watchlist/:sym', authMiddleware, (req: any, res: Response) => {
  db.prepare('DELETE FROM watchlist WHERE user_id = ? AND symbol = ?').run(req.user.id, req.params.sym.toUpperCase());
  res.json(db.prepare('SELECT * FROM watchlist WHERE user_id = ?').all(req.user.id));
});

// Portfolio
router.get('/portfolio', authMiddleware, (req: any, res: Response) => {
  res.json(db.prepare('SELECT symbol,shares,avg_cost FROM portfolio WHERE user_id = ?').all(req.user.id));
});
router.post('/portfolio', authMiddleware, (req: any, res: Response) => {
  const { sym, shares, avgCost } = req.body;
  if (!sym) return res.status(400).json({ error: 'Symbol required' });
  db.prepare('INSERT OR REPLACE INTO portfolio (user_id,symbol,shares,avg_cost) VALUES (?,?,?,?)')
    .run(req.user.id, sym.toUpperCase(), shares, avgCost);
  res.json(db.prepare('SELECT symbol,shares,avg_cost FROM portfolio WHERE user_id = ?').all(req.user.id));
});
router.delete('/portfolio/:sym', authMiddleware, (req: any, res: Response) => {
  db.prepare('DELETE FROM portfolio WHERE user_id = ? AND symbol = ?').run(req.user.id, req.params.sym.toUpperCase());
  res.json(db.prepare('SELECT symbol,shares,avg_cost FROM portfolio WHERE user_id = ?').all(req.user.id));
});

// Alerts
router.get('/alerts', authMiddleware, (req: any, res: Response) => {
  res.json(db.prepare('SELECT * FROM alerts WHERE user_id = ?').all(req.user.id));
});
router.post('/alerts', authMiddleware, (req: any, res: Response) => {
  const { sym, type, threshold } = req.body;
  const id = Date.now().toString();
  db.prepare('INSERT INTO alerts (id,user_id,symbol,type,threshold,active) VALUES (?,?,?,?,?,1)')
    .run(id, req.user.id, sym.toUpperCase(), type, threshold ?? '');
  res.json(db.prepare('SELECT * FROM alerts WHERE user_id = ?').all(req.user.id));
});
router.patch('/alerts/:id', authMiddleware, (req: any, res: Response) => {
  const { active } = req.body;
  if (typeof active === 'boolean') {
    db.prepare('UPDATE alerts SET active = ? WHERE id = ? AND user_id = ?')
      .run(active ? 1 : 0, req.params.id, req.user.id);
  }
  res.json(db.prepare('SELECT * FROM alerts WHERE user_id = ?').all(req.user.id));
});
router.delete('/alerts/:id', authMiddleware, (req: any, res: Response) => {
  db.prepare('DELETE FROM alerts WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json(db.prepare('SELECT * FROM alerts WHERE user_id = ?').all(req.user.id));
});

// Push notifications
router.get('/notifications', authMiddleware, (req: any, res: Response) => {
  const user = db.prepare('SELECT push_price_alerts, push_news_alerts FROM users WHERE id = ?').get(req.user.id) as
    | { push_price_alerts: number; push_news_alerts: number }
    | undefined;
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({
    pushPriceAlerts: user.push_price_alerts === 1,
    pushNewsAlerts: user.push_news_alerts === 1,
  });
});

router.patch('/notifications', authMiddleware, (req: any, res: Response) => {
  const { pushPriceAlerts, pushNewsAlerts } = req.body as {
    pushPriceAlerts?: boolean;
    pushNewsAlerts?: boolean;
  };
  if (typeof pushPriceAlerts === 'boolean') {
    db.prepare('UPDATE users SET push_price_alerts = ? WHERE id = ?')
      .run(pushPriceAlerts ? 1 : 0, req.user.id);
  }
  if (typeof pushNewsAlerts === 'boolean') {
    db.prepare('UPDATE users SET push_news_alerts = ? WHERE id = ?')
      .run(pushNewsAlerts ? 1 : 0, req.user.id);
  }
  const user = db.prepare('SELECT push_price_alerts, push_news_alerts FROM users WHERE id = ?').get(req.user.id) as
    { push_price_alerts: number; push_news_alerts: number };
  res.json({
    pushPriceAlerts: user.push_price_alerts === 1,
    pushNewsAlerts: user.push_news_alerts === 1,
  });
});

router.post('/push-token', authMiddleware, (req: any, res: Response) => {
  const { token, platform } = req.body as { token?: string; platform?: string };
  if (!token || !platform) return res.status(400).json({ error: 'token and platform required' });
  registerPushToken(req.user.id, token, platform);
  res.json({ ok: true });
});

router.delete('/push-token', authMiddleware, (req: any, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token) return res.status(400).json({ error: 'token required' });
  removePushToken(req.user.id, token);
  res.json({ ok: true });
});

// Analytics
router.post('/analytics', (req: any, res: Response) => {
  const { tab } = req.body;
  const userId = req.headers.authorization
    ? (() => { try { return (jwt.verify(req.headers.authorization.replace('Bearer ',''), JWT_SECRET) as any).id; } catch { return null; } })()
    : null;
  if (tab) db.prepare('INSERT INTO analytics (user_id,tab,ts) VALUES (?,?,?)').run(userId, tab, new Date().toISOString());
  res.json({ ok: true });
});
router.get('/analytics/summary', authMiddleware, (req: any, res: Response) => {
  const rows = db.prepare('SELECT tab, COUNT(*) as views FROM analytics GROUP BY tab ORDER BY views DESC').all();
  res.json(rows);
});

// Plan upgrade (Stripe webhook updates this)
router.post('/upgrade', authMiddleware, (req: any, res: Response) => {
  const { plan } = req.body;
  if (!['pro','professional','institutional'].includes(plan)) return res.status(400).json({ error: 'Invalid plan' });
  db.prepare('UPDATE users SET plan = ?, trial_ends = NULL WHERE id = ?').run(plan, req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as DBUser;
  res.json({ token: makeToken(user), user: safeUser(user) });
});

export default router;
