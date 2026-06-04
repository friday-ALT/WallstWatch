import nodemailer from 'nodemailer';
import axios from 'axios';
import db from '../db/database.js';
import { getQuote } from './quotes.js';

export async function runAlertEngine() {
  const alerts = db.prepare('SELECT * FROM alerts WHERE active = 1').all() as {
    id: string; user_id: string; symbol: string; type: string; threshold: string;
  }[];
  for (const a of alerts) {
    try {
      const q = await getQuote(a.symbol);
      if (!q) continue;
      const price = q.c;
      const pct = q.dp;
      const thresh = parseFloat(a.threshold) || 0;
      let fired = false;
      let msg = '';
      if (a.type === 'PRICE_ABOVE' && price >= thresh) { fired = true; msg = `${a.symbol} crossed above $${thresh} (now $${price.toFixed(2)})`; }
      if (a.type === 'PRICE_BELOW' && price <= thresh) { fired = true; msg = `${a.symbol} fell below $${thresh} (now $${price.toFixed(2)})`; }
      if (a.type === 'PCT_CHANGE' && Math.abs(pct) >= thresh) { fired = true; msg = `${a.symbol} moved ${pct >= 0 ? '+' : ''}${pct.toFixed(2)}% (threshold ${thresh}%)`; }
      if (!fired) continue;
      const recent = db.prepare(
        `SELECT id FROM alert_events WHERE alert_id = ? AND created_at > datetime('now', '-1 hour')`
      ).get(a.id);
      if (recent) continue;
      const eventId = `${Date.now()}-${a.id}`;
      db.prepare('INSERT INTO alert_events (id,user_id,alert_id,symbol,message) VALUES (?,?,?,?,?)')
        .run(eventId, a.user_id, a.id, a.symbol, msg);
      db.prepare(`UPDATE alerts SET last_fired = datetime('now') WHERE id = ?`).run(a.id);
      const user = db.prepare('SELECT email, name FROM users WHERE id = ?').get(a.user_id) as { email: string; name: string } | undefined;
      if (user) await sendAlertEmail(user.email, user.name, msg);
      const hook = db.prepare('SELECT url FROM slack_webhooks WHERE user_id = ?').get(a.user_id) as { url: string } | undefined;
      if (hook?.url) await postSlack(hook.url, msg);
    } catch { /* skip */ }
  }
}

async function sendAlertEmail(to: string, name: string, message: string) {
  const user = process.env.NODEMAILER_USER;
  const pass = process.env.NODEMAILER_PASS;
  if (!user || !pass) return;
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  await transporter.sendMail({
    from: `"WALLST WATCH Alerts" <${user}>`,
    to,
    subject: `◆ Alert: ${message.slice(0, 60)}`,
    html: `<div style="font-family:monospace;background:#0a0c0f;color:#e8ecf0;padding:24px"><div style="color:#ff3b3b;font-weight:700">◆ WALLST WATCH ALERT</div><p>Hi ${name},</p><p>${message}</p><a href="${process.env.CLIENT_URL ?? 'http://localhost:5173'}/dashboard">Open Terminal →</a></div>`,
  });
}

async function postSlack(url: string, text: string) {
  await axios.post(url, { text: `◆ WALLST WATCH: ${text}` }, { timeout: 5000 });
}
