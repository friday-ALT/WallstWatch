import { Router } from 'express';
import { config } from '../config/index.js';
import { getCachedQuotes } from '../services/quotes.js';
import {
  getSectorQuotes,
  getYieldCurve,
  getFxMatrix,
  getMarketBreadth,
  getMacroRates,
} from '../services/marketData.js';

const router = Router();

type Health = 'ok' | 'degraded' | 'down';

async function probe<T>(fn: () => Promise<T>, minItems = 1): Promise<{ health: Health; count: number }> {
  try {
    const result = await fn();
    const count = Array.isArray(result) ? result.length : Object.keys(result as object).length;
    const hasData = Array.isArray(result)
      ? result.some((r: { c?: number | null; price?: number | null; yield?: number | null }) =>
          r.c != null || r.price != null || r.yield != null,
        )
      : count >= minItems;
    return { health: hasData ? 'ok' : 'degraded', count };
  } catch {
    return { health: 'down', count: 0 };
  }
}

router.get('/', async (_req, res) => {
  const [quotes, sectors, yields, fx, breadth] = await Promise.all([
    Promise.resolve({ health: Object.keys(getCachedQuotes()).length > 0 ? 'ok' : 'degraded' as Health, count: Object.keys(getCachedQuotes()).length }),
    probe(getSectorQuotes),
    probe(getYieldCurve),
    probe(getFxMatrix),
    probe(getMarketBreadth),
  ]);

  const services = {
    quotes: { ...quotes, label: 'Equity quotes' },
    sectors: { ...sectors, label: 'Sector ETFs' },
    yieldCurve: { ...yields, label: 'Yield curve' },
    fx: { ...fx, label: 'FX matrix' },
    breadth: { ...breadth, label: 'Market breadth' },
    finnhub: { health: config.finnhub.apiKey ? 'ok' : 'down' as Health, label: 'Finnhub API key' },
    stripe: { health: config.stripe.secretKey ? 'ok' : 'degraded' as Health, label: 'Stripe' },
    anthropic: { health: config.anthropic.apiKey ? 'ok' : 'degraded' as Health, label: 'AI research' },
  };

  const values = Object.values(services).map((s) => s.health);
  const overall: Health = values.includes('down')
    ? 'degraded'
    : values.includes('degraded')
      ? 'degraded'
      : 'ok';

  res.json({
    service: 'wallst-watch-api',
    status: overall,
    timestamp: new Date().toISOString(),
    services,
  });
});

router.get('/macro', async (_req, res) => {
  try {
    res.json(await getMacroRates());
  } catch {
    res.status(500).json({ error: 'macro rates failed' });
  }
});

export default router;
