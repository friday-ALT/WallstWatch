import dotenv from 'dotenv';

dotenv.config();

function requireInProduction(value: string | undefined, name: string, fallback?: string): string {
  const v = value ?? fallback ?? '';
  if (process.env.NODE_ENV === 'production' && !v) {
    console.warn(`[config] Missing ${name} in production`);
  }
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  unlockAll: process.env.UNLOCK_ALL === 'true',
  jwtSecret: requireInProduction(
    process.env.JWT_SECRET,
    'JWT_SECRET',
    'wallst-watch-secret-CHANGE-IN-PROD',
  ),
  trialDays: 14,
  finnhub: {
    apiKey: process.env.FINNHUB_API_KEY ?? '',
    baseUrl: 'https://finnhub.io/api/v1',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY ?? '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    pricePro: process.env.STRIPE_PRICE_PRO ?? '',
    priceProfessional: process.env.STRIPE_PRICE_PROFESSIONAL ?? '',
  },
  mail: {
    user: process.env.NODEMAILER_USER ?? '',
    pass: process.env.NODEMAILER_PASS ?? '',
  },
  cacheTtl: {
    quotesSec: 15,
    newsSec: 120,
    macroSec: 300,
    fundamentalsSec: 86400,
  },
  planRank: {
    free: 0,
    pro: 1,
    professional: 2,
    institutional: 3,
  } as const,
};

export type PlanTier = keyof typeof config.planRank;
