import cron from 'node-cron';
import nodemailer from 'nodemailer';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import db from './db/database.js';

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });
const API    = 'https://finnhub.io/api/v1';
const fh     = axios.create({ baseURL: API, params: { token: process.env.FINNHUB_API_KEY ?? '' } });

const TRACKED_BANKS = ['JPM', 'GS', 'MS', 'BAC', 'C', 'WFC', 'DB', 'UBS', 'BCS', 'HSBC', 'BNP', 'SCHW'];
const MACRO_SYMBOLS = ['US10Y', 'US2Y', 'DXY', 'VIX'];

interface DBUser { id: string; email: string; name: string; plan: string; daily_brief_email: number; }

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function fetchBankQuotes() {
  const results = await Promise.allSettled(
    TRACKED_BANKS.map(async (s) => {
      const { data } = await fh.get('/quote', { params: { symbol: s } });
      return { sym: s, price: data.c, change: data.d, changePct: data.dp, prevClose: data.pc };
    })
  );
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map(r => r.value);
}

async function fetchTopNews() {
  try {
    const { data } = await fh.get('/news', { params: { category: 'general' } });
    return (data as any[]).slice(0, 8).map((n: any) => n.headline);
  } catch { return []; }
}

async function fetchInsiderActivity() {
  const results = await Promise.allSettled(
    ['JPM', 'GS', 'MS', 'BAC', 'C', 'WFC'].map(async (s) => {
      const { data } = await fh.get('/stock/insider-transactions', { params: { symbol: s } });
      const recent = (data.data ?? []).filter((t: any) => {
        const d = new Date(t.transactionDate ?? t.filingDate ?? '');
        return Date.now() - d.getTime() < 48 * 3600 * 1000;
      });
      return recent.map((t: any) => ({ ...t, sym: s }));
    })
  );
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .sort((a: any, b: any) => Math.abs(b.transactionShares * b.transactionPrice) - Math.abs(a.transactionShares * a.transactionPrice))
    .slice(0, 5);
}

async function fetchEconomicEventsToday() {
  try {
    const { data } = await fh.get('/calendar/economic');
    const today = new Date().toISOString().slice(0, 10);
    return (data.economicCalendar ?? [])
      .filter((e: any) => e.time?.startsWith(today) && e.impact === 'high')
      .slice(0, 5)
      .map((e: any) => `${e.event} (${e.country}) — est: ${e.estimate ?? 'N/A'}, prev: ${e.prev ?? 'N/A'}`);
  } catch { return []; }
}

async function fetchYieldCurve() {
  try {
    const results = await Promise.allSettled(
      ['US3MY', 'US2Y', 'US10Y', 'US30Y'].map(async (s) => {
        const { data } = await fh.get('/quote', { params: { symbol: s } });
        return { tenor: s.replace('US', '').replace('Y', 'Y').replace('MY', 'M'), yield: data.c, chg: data.d };
      })
    );
    return results
      .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
      .map(r => r.value);
  } catch { return []; }
}

// ── Claude brief generator ────────────────────────────────────────────────────

async function generateBrief(data: {
  date: string;
  banks: any[];
  news: string[];
  insiders: any[];
  events: string[];
  yields: any[];
}): Promise<string> {
  const bankLines = data.banks
    .map(b => `  ${b.sym}: $${b.price?.toFixed(2) ?? 'N/A'} (${b.changePct >= 0 ? '+' : ''}${b.changePct?.toFixed(2) ?? 'N/A'}%)`)
    .join('\n');

  const insiderLines = data.insiders.length
    ? data.insiders.map((t: any) =>
        `  ${t.sym} — ${t.name ?? 'Executive'} ${t.transactionShares > 0 ? 'BOUGHT' : 'SOLD'} ${Math.abs(t.transactionShares).toLocaleString()} shares @ $${t.transactionPrice} (${t.transactionType ?? ''})`
      ).join('\n')
    : '  No material insider transactions in the last 48 hours.';

  const newsLines = data.news.map(h => `  · ${h}`).join('\n');
  const eventLines = data.events.length ? data.events.map(e => `  · ${e}`).join('\n') : '  No high-impact events scheduled today.';
  const yieldLines = data.yields.map(y => `  ${y.tenor}: ${y.yield?.toFixed(2) ?? 'N/A'}% (${y.chg >= 0 ? '+' : ''}${y.chg?.toFixed(2) ?? 'N/A'}bps)`).join('\n');

  const prompt = `You are the chief economist at a major investment bank. It is 8:00 AM London time on ${data.date}. You are writing the daily morning briefing that will be emailed to institutional clients — traders, portfolio managers, and senior analysts. They have 90 seconds to read it before the market opens.

LIVE MARKET DATA AS OF NOW:

BANKING SECTOR (price / 24h change):
${bankLines}

US TREASURY YIELDS:
${yieldLines}

INSIDER TRANSACTIONS (last 48 hours):
${insiderLines}

HIGH-IMPACT ECONOMIC EVENTS TODAY:
${eventLines}

TOP NEWS HEADLINES:
${newsLines}

Write the morning brief in exactly these five sections. Each section must be 2–4 sentences. Be direct, quantitative, and authoritative — no hedging language, no filler. Write as if you are a senior economist who has seen every cycle since 1987 and has zero patience for noise.

**MARKET OPEN**
[Overnight moves, pre-market tone, what the opening hour will look like and why]

**BANKING SECTOR**
[The single most important development across the tracked banks — price action, credit concerns, capital ratios, or a structural shift worth flagging]

**INSIDER SIGNAL**
[What the insider transaction data is telling us — aggregate sentiment, the most significant individual trade, and what it implies]

**MACRO WATCH**
[Fed policy, yield curve, FX, and any economic data due today — their interconnection and what moves the needle]

**TODAY'S RISK**
[The one specific risk that institutional investors should have on their radar today — name it, quantify it, and say what you'd watch for]

End with a single line in this exact format:
WALLST WATCH SIGNAL: [RISK-OFF / NEUTRAL / RISK-ON] · ${data.date}`;

  const message = await claude.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : '';
}

// ── HTML email builder ────────────────────────────────────────────────────────

function buildEmailHtml(brief: string, data: {
  date: string;
  banks: any[];
  insiders: any[];
  events: string[];
  userName: string;
  unsubscribeToken: string;
}): string {
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

  const topMover = [...data.banks].sort((a, b) =>
    Math.abs(b.changePct ?? 0) - Math.abs(a.changePct ?? 0)
  )[0];

  const bankTableRows = data.banks.map(b => {
    const up = (b.changePct ?? 0) >= 0;
    return `
      <tr>
        <td style="font-family:monospace;font-size:12px;font-weight:700;color:#e8eaed;padding:7px 12px;border-bottom:1px solid #1e2530">${b.sym}</td>
        <td style="font-family:monospace;font-size:12px;color:#e8eaed;padding:7px 12px;border-bottom:1px solid #1e2530">$${b.price?.toFixed(2) ?? '—'}</td>
        <td style="font-family:monospace;font-size:11px;font-weight:700;color:${up ? '#00e676' : '#ff3b3b'};padding:7px 12px;border-bottom:1px solid #1e2530">${up ? '+' : ''}${b.changePct?.toFixed(2) ?? '—'}%</td>
      </tr>`;
  }).join('');

  // Format the brief text into HTML sections
  const briefHtml = brief
    .split('\n')
    .map(line => {
      if (line.startsWith('**') && line.endsWith('**')) {
        const title = line.replace(/\*\*/g, '');
        return `<div style="font-family:monospace;font-size:10px;font-weight:700;color:#ff3b3b;letter-spacing:2px;margin-top:24px;margin-bottom:6px;padding-top:16px;border-top:1px solid #1e2530">${title}</div>`;
      }
      if (line.startsWith('WALLST WATCH SIGNAL:')) {
        const isRiskOff = line.includes('RISK-OFF');
        const isRiskOn  = line.includes('RISK-ON');
        const color = isRiskOff ? '#ff3b3b' : isRiskOn ? '#00e676' : '#ffc107';
        return `<div style="font-family:monospace;font-size:11px;font-weight:700;color:${color};margin-top:24px;padding:12px 16px;background:${color}18;border:1px solid ${color}44;border-radius:3px;letter-spacing:1px">${line}</div>`;
      }
      if (line.trim()) {
        return `<p style="font-family:monospace;font-size:12px;color:#8b95a5;line-height:1.8;margin:0 0 4px 0">${line}</p>`;
      }
      return '';
    })
    .join('');

  const eventsList = data.events.length
    ? data.events.map(e => `<li style="font-family:monospace;font-size:11px;color:#8b95a5;padding:4px 0;border-bottom:1px solid #1e2530">${e}</li>`).join('')
    : `<li style="font-family:monospace;font-size:11px;color:#4a5568;padding:4px 0">No high-impact events scheduled</li>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0c0f">
<div style="max-width:640px;margin:0 auto;background:#0a0c0f;font-family:monospace">

  <!-- Header -->
  <div style="background:#080a0d;border-bottom:2px solid #ff3b3b;padding:20px 32px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <div style="font-size:20px;font-weight:700;letter-spacing:5px;color:#ff3b3b">◆ WALLST WATCH</div>
      <div style="font-size:9px;color:#4a5568;letter-spacing:3px;margin-top:3px">MORNING BRIEF · ${data.date} · 08:00 GMT</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:8px;color:#4a5568;letter-spacing:2px">PREPARED FOR</div>
      <div style="font-size:12px;color:#e8eaed;font-weight:700;margin-top:2px">${data.userName.toUpperCase()}</div>
    </div>
  </div>

  <!-- Top mover callout -->
  ${topMover ? `
  <div style="background:#141820;border-bottom:1px solid #1e2530;padding:12px 32px;display:flex;align-items:center;gap:16px">
    <div style="font-size:8px;color:#4a5568;letter-spacing:2px">TOP MOVER</div>
    <div style="font-size:16px;font-weight:700;color:#e8eaed;letter-spacing:2px">${topMover.sym}</div>
    <div style="font-size:14px;font-weight:700;color:${(topMover.changePct ?? 0) >= 0 ? '#00e676' : '#ff3b3b'}">
      ${(topMover.changePct ?? 0) >= 0 ? '▲' : '▼'} ${Math.abs(topMover.changePct ?? 0).toFixed(2)}%
    </div>
    <div style="font-size:12px;color:#8b95a5">$${topMover.price?.toFixed(2) ?? '—'}</div>
  </div>` : ''}

  <!-- Main brief -->
  <div style="padding:28px 32px;background:#0f1216;border-bottom:1px solid #1e2530">
    <div style="font-size:10px;color:#4a5568;letter-spacing:3px;margin-bottom:16px">ECONOMIST'S BRIEFING</div>
    ${briefHtml}
  </div>

  <!-- Bank grid -->
  <div style="padding:24px 32px;border-bottom:1px solid #1e2530">
    <div style="font-size:10px;font-weight:700;color:#4a5568;letter-spacing:3px;margin-bottom:14px">BANKING SECTOR · LIVE SNAPSHOT</div>
    <table style="width:100%;border-collapse:collapse">
      <tr style="border-bottom:1px solid #1e2530">
        <th style="font-family:monospace;font-size:8px;color:#4a5568;letter-spacing:2px;text-align:left;padding:5px 12px">SYMBOL</th>
        <th style="font-family:monospace;font-size:8px;color:#4a5568;letter-spacing:2px;text-align:left;padding:5px 12px">PRICE</th>
        <th style="font-family:monospace;font-size:8px;color:#4a5568;letter-spacing:2px;text-align:left;padding:5px 12px">24H CHG</th>
      </tr>
      ${bankTableRows}
    </table>
  </div>

  <!-- Events today -->
  <div style="padding:24px 32px;border-bottom:1px solid #1e2530">
    <div style="font-size:10px;font-weight:700;color:#4a5568;letter-spacing:3px;margin-bottom:14px">HIGH-IMPACT EVENTS TODAY</div>
    <ul style="margin:0;padding:0;list-style:none">
      ${eventsList}
    </ul>
  </div>

  <!-- CTA -->
  <div style="padding:28px 32px;text-align:center;border-bottom:1px solid #1e2530;background:#080a0d">
    <p style="font-size:11px;color:#4a5568;margin:0 0 16px 0">Full intelligence dashboard with live data, AI research, and alerts</p>
    <a href="${clientUrl}/dashboard"
       style="display:inline-block;background:#ff3b3b;color:#fff;font-family:monospace;font-size:11px;font-weight:700;letter-spacing:2px;padding:13px 32px;text-decoration:none;border-radius:3px">
      OPEN COMMAND CENTER →
    </a>
  </div>

  <!-- Footer -->
  <div style="padding:20px 32px;background:#080a0d">
    <p style="font-size:10px;color:#4a5568;line-height:1.7;margin:0 0 12px 0">
      This briefing is generated using live market data from Finnhub and AI analysis by Anthropic Claude. It does not constitute financial advice. Past performance is not indicative of future results. WALLST WATCH is not a registered investment adviser.
    </p>
    <div style="display:flex;gap:16px;align-items:center">
      <a href="${clientUrl}/unsubscribe?token=${data.unsubscribeToken}"
         style="font-family:monospace;font-size:9px;color:#4a5568;text-decoration:underline">
        Unsubscribe from daily briefs
      </a>
      <span style="font-size:9px;color:#2a3040">·</span>
      <a href="${clientUrl}/dashboard"
         style="font-family:monospace;font-size:9px;color:#4a5568;text-decoration:underline">
        Manage account
      </a>
    </div>
  </div>

</div>
</body>
</html>`;
}

// ── Mailer ────────────────────────────────────────────────────────────────────

async function sendBriefToUser(user: DBUser, brief: string, briefData: any) {
  const mailerUser = process.env.NODEMAILER_USER;
  const mailerPass = process.env.NODEMAILER_PASS;
  if (!mailerUser || !mailerPass) return;

  // Simple signed token: base64 of userId (production: use jwt or hmac)
  const unsubscribeToken = Buffer.from(user.id).toString('base64url');

  const html = buildEmailHtml(brief, {
    date: briefData.date,
    banks: briefData.banks,
    insiders: briefData.insiders,
    events: briefData.events,
    userName: user.name,
    unsubscribeToken,
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: mailerUser, pass: mailerPass },
  });

  await transporter.sendMail({
    from: `"WALLST WATCH" <${mailerUser}>`,
    to: user.email,
    subject: `◆ Morning Brief — ${briefData.date} · Banking Intelligence`,
    html,
    text: `WALLST WATCH MORNING BRIEF — ${briefData.date}\n\n${brief}\n\nOpen Command Center: ${process.env.CLIENT_URL ?? 'http://localhost:5173'}/dashboard\n\nUnsubscribe: ${process.env.CLIENT_URL ?? 'http://localhost:5173'}/unsubscribe?token=${unsubscribeToken}`,
  });
}

// ── Main job ──────────────────────────────────────────────────────────────────

export async function sendDailyBrief() {
  console.log('◆ Daily brief job starting…');

  if (!process.env.ANTHROPIC_API_KEY || !process.env.FINNHUB_API_KEY) {
    console.warn('  Skipping — ANTHROPIC_API_KEY or FINNHUB_API_KEY not set');
    return;
  }

  const date = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London',
  });

  // Fetch all data in parallel
  const [banks, news, insiders, events, yields] = await Promise.all([
    fetchBankQuotes(),
    fetchTopNews(),
    fetchInsiderActivity(),
    fetchEconomicEventsToday(),
    fetchYieldCurve(),
  ]);

  console.log(`  Data fetched — ${banks.length} banks, ${news.length} headlines, ${insiders.length} insider trades`);

  // Generate the brief once (shared across all subscribers)
  let brief: string;
  try {
    brief = await generateBrief({ date, banks, news, insiders, events, yields });
    console.log('  Claude brief generated ✓');
  } catch (e: any) {
    console.error('  Claude generation failed:', e.message);
    return;
  }

  // Get all opted-in Pro+ users
  const subscribers = db.prepare(
    `SELECT id, email, name, plan, daily_brief_email FROM users
     WHERE daily_brief_email = 1
     AND plan IN ('pro', 'professional', 'institutional')`
  ).all() as DBUser[];

  // Also include users on active trial
  const trialSubscribers = db.prepare(
    `SELECT id, email, name, plan, daily_brief_email FROM users
     WHERE daily_brief_email = 1
     AND trial_ends IS NOT NULL
     AND trial_ends > datetime('now')`
  ).all() as DBUser[];

  const allSubscribers = [...new Map(
    [...subscribers, ...trialSubscribers].map(u => [u.id, u])
  ).values()];

  console.log(`  Sending to ${allSubscribers.length} subscriber(s)…`);

  // Send one by one (avoid rate limits)
  for (const user of allSubscribers) {
    try {
      await sendBriefToUser(user, brief, { date, banks, insiders, events });
      console.log(`  ✓ Sent to ${user.email}`);
      // Small delay between sends
      await new Promise(r => setTimeout(r, 500));
    } catch (e: any) {
      console.error(`  ✗ Failed for ${user.email}:`, e.message);
    }
  }

  console.log('◆ Daily brief job complete.');
}

// ── Scheduler — 8:00 AM UK time (Europe/London handles GMT/BST automatically) ──

export function startDailyBriefScheduler() {
  // node-cron timezone support: runs at 08:00 London time, Mon–Fri
  cron.schedule('0 8 * * 1-5', sendDailyBrief, { timezone: 'Europe/London' });
  console.log('◆ Daily brief scheduler active — fires at 08:00 Europe/London (Mon–Fri)');
}
