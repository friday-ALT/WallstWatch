import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const INDIVIDUAL_PLANS = [
  {
    name: 'FREE',
    price: { monthly: 0, annual: 0 },
    period: 'forever',
    color: '#4a5568',
    badge: null,
    tagline: 'Get started — no card required',
    features: [
      { label: 'Bank Map — top 6 banks', included: true },
      { label: 'Daily Brief — 3 sections', included: true },
      { label: 'Delayed quotes (15 min)', included: true },
      { label: '5 news items per day', included: true },
      { label: 'Live WebSocket prices', included: false },
      { label: 'Insider transactions', included: false },
      { label: 'Earnings calendar', included: false },
      { label: 'Fed Watch & FOMC', included: false },
      { label: 'FX, Bonds & Commodities', included: false },
      { label: 'Portfolio tracker', included: false },
    ],
    cta: 'Get Started Free',
    route: '/signup',
  },
  {
    name: 'PRO',
    price: { monthly: 2.99, annual: 2.99 },
    currency: '£',
    period: 'per month',
    color: '#ff3b3b',
    badge: 'MOST POPULAR',
    tagline: 'Full terminal access',
    features: [
      { label: 'Everything in Free', included: true },
      { label: 'All 12 banks tracked', included: true },
      { label: 'Live WebSocket prices', included: true },
      { label: 'Full Daily Brief — 6 sections', included: true },
      { label: 'Insider transactions (real-time)', included: true },
      { label: 'Earnings calendar (30-day)', included: true },
      { label: 'Fed Watch & FOMC tracker', included: true },
      { label: 'FX, Bonds & Commodities', included: true },
      { label: 'TradingView charts', included: true },
      { label: 'Email alerts — 5 active', included: true },
    ],
    cta: 'Start Pro',
  },
  {
    name: 'PROFESSIONAL',
    price: { monthly: 7.99, annual: 7.99 },
    currency: '£',
    period: 'per month',
    color: '#b388ff',
    badge: 'BEST VALUE',
    tagline: 'For serious analysts',
    features: [
      { label: 'Everything in Pro', included: true },
      { label: 'AI research notes (on demand)', included: true },
      { label: 'Stock screener — all metrics', included: true },
      { label: 'Options flow tracker', included: true },
      { label: 'Dark pool activity', included: true },
      { label: 'Sector rotation analysis', included: true },
      { label: 'PDF report export', included: true },
      { label: 'Unlimited email alerts', included: true },
      { label: 'Unlimited watchlists', included: true },
      { label: 'Priority support', included: true },
    ],
    cta: 'Start Professional',
  },
];

const BUSINESS_PLANS = [
  {
    name: 'TEAMS',
    price: { monthly: 99, annual: 79 },
    period: 'per month',
    color: '#ffc107',
    badge: 'BEST VALUE',
    tagline: '5 seats — shared intelligence',
    features: [
      { label: 'Everything in Professional', included: true },
      { label: '5 team seats', included: true },
      { label: 'Shared watchlists', included: true },
      { label: 'Webhook alerts (Slack)', included: true },
      { label: 'Custom bank watchlists', included: true },
      { label: 'Centralized billing', included: true },
      { label: 'Team analytics dashboard', included: true },
      { label: 'White-label reports', included: true },
    ],
    cta: 'Start Teams',
    stripeLink: 'https://buy.stripe.com/your_teams_link',
  },
  {
    name: 'INSTITUTIONAL',
    price: { monthly: null, annual: null },
    period: 'tailored pricing',
    color: '#00bcd4',
    badge: 'TAILORED',
    tagline: 'For enterprises & hedge funds',
    features: [
      { label: 'Everything in Teams', included: true },
      { label: 'Unlimited seats', included: true },
      { label: 'API access (JSON endpoints)', included: true },
      { label: 'Custom data integrations', included: true },
      { label: 'Dedicated Slack support', included: true },
      { label: 'SLA guarantee', included: true },
      { label: 'Custom onboarding', included: true },
      { label: 'Fastest data processing', included: true },
    ],
    cta: 'Contact Sales',
    route: 'mailto:hello@wallstwatch.com',
  },
];

const FAQ = [
  { q: 'Do I need a credit card to start?', a: 'No. The free tier is genuinely free — no card required. Upgrade any time from your account settings.' },
  { q: 'What data sources do you use?', a: 'Finnhub API for real-time quotes, news, and fundamentals. SEC EDGAR for insider filings. Federal Reserve for rate data. Anthropic Claude for AI research.' },
  { q: 'How is this different from Bloomberg?', a: 'Bloomberg costs ~$2,000/month. WallSt Watch Pro is £2.99/month — web-native, AI-powered, and a fraction of the cost.' },
  { q: 'Is VAT included?', a: 'Prices are shown in GBP. Stripe Tax calculates VAT or sales tax at checkout based on your billing address (inclusive or exclusive per your Stripe price settings).' },
  { q: 'Can I cancel any time?', a: 'Yes. Cancel from your account settings with one click. No questions, no friction.' },
  { q: 'Is the market data delayed?', a: 'Pro and above get live WebSocket quotes updating every 8 seconds. Free tier has 15-minute delayed prices.' },
  { q: 'Do you offer annual billing?', a: 'Monthly billing at launch. Annual plans may be added later.' },
];

const PLAN_STRIPE: Record<string, string> = {
  PRO: 'pro',
  PROFESSIONAL: 'professional',
};

function PlanCard({ plan, annual, isBusiness = false }: { plan: typeof INDIVIDUAL_PLANS[0] | typeof BUSINESS_PLANS[0], annual: boolean, isBusiness?: boolean }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const price = annual ? (plan.price as any).annual : (plan.price as any).monthly;
  const currency = (plan as { currency?: string }).currency ?? '£';
  const isHighlighted = plan.badge === 'MOST POPULAR' || plan.badge === 'BEST VALUE';
  const isCurrent = user && plan.name === user.plan.toUpperCase();

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1px solid ${isHighlighted ? plan.color + '88' : 'var(--border)'}`,
      borderTop: `2px solid ${plan.color}`,
      borderRadius: 4,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      position: 'relative',
      boxShadow: isHighlighted ? `0 0 40px ${plan.color}18` : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      flex: isBusiness ? 1 : undefined,
    }}>
      {plan.badge && (
        <div style={{
          position: 'absolute', top: -1, right: 16,
          background: plan.color, color: plan.name === 'FREE' ? '#fff' : '#0a0c0f',
          fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 700, letterSpacing: 1.5,
          padding: '3px 10px', borderRadius: '0 0 4px 4px',
        }}>
          {plan.badge}
        </div>
      )}

      {/* Plan name + tagline */}
      <div style={{ marginBottom: 20 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: plan.color + '18', border: `1px solid ${plan.color}44`,
          padding: '3px 10px', borderRadius: 2, marginBottom: 12,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: plan.color }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: plan.color, letterSpacing: 2 }}>{plan.name}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>{plan.tagline}</div>
      </div>

      {/* Price */}
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {price === null ? (
          <div style={{ fontFamily: 'var(--font-disp)', fontSize: 40, letterSpacing: 2, color: 'var(--text)', lineHeight: 1 }}>Custom</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-disp)', fontSize: 44, letterSpacing: 2, color: 'var(--text)', lineHeight: 1 }}>
              {currency}{typeof price === 'number' ? price.toFixed(2) : price}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>/mo</span>
          </div>
        )}
        {annual && price !== null && price > 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--green)', marginTop: 4, letterSpacing: 1 }}>
            ↓ BILLED ANNUALLY — SAVE 20%
          </div>
        )}
        {price === 0 && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginTop: 4 }}>forever free</div>
        )}
      </div>

      {/* Features */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 24 }}>
        {plan.features.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: f.included ? plan.color : 'var(--border-glow)',
              flexShrink: 0, width: 12,
            }}>
              {f.included ? '✓' : '—'}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: f.included ? 'var(--text-sec)' : 'var(--text-dim)',
              lineHeight: 1.4,
            }}>
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={async () => {
          if (isCurrent) return;
          if ((plan as any).route) {
            const r = (plan as any).route;
            if (r.startsWith('mailto')) window.location.href = r;
            else navigate(r);
            return;
          }
          const stripePlan = PLAN_STRIPE[plan.name];
          if (stripePlan && token) {
            try {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ plan: stripePlan }),
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
              else alert(data.error ?? 'Checkout unavailable — add STRIPE_PRICE_* in server .env');
            } catch {
              alert('Could not start checkout. Is the API server running?');
            }
            return;
          }
          if (stripePlan && !token) {
            navigate('/signup');
            return;
          }
          if ((plan as any).stripeLink) {
            window.open((plan as any).stripeLink, '_blank');
          }
        }}
        style={{
          background: isHighlighted && !isCurrent ? plan.color : 'transparent',
          color: isCurrent ? 'var(--green)' : isHighlighted ? '#0a0c0f' : plan.color,
          border: `1px solid ${isCurrent ? 'var(--green)' : plan.color}`,
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: 1,
          padding: '12px 16px', borderRadius: 3, cursor: isCurrent ? 'default' : 'pointer',
          transition: 'all .2s', textTransform: 'uppercase',
          opacity: plan.name === 'FREE' && !user ? 1 : 1,
        }}
      >
        {isCurrent ? '✓ CURRENT PLAN' : plan.cta}
      </button>
    </div>
  );
}

export function Pricing() {
  const [annual, setAnnual] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toUTCString().slice(17, 25) + ' UTC');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>

      {/* Terminal Header Bar */}
      <div style={{
        background: 'var(--bg-panel)',
        borderBottom: '1px solid var(--border)',
        padding: '8px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text-dim)',
      }}>
        <span style={{ color: 'var(--red)', fontWeight: 700 }}>◆ WALLST WATCH</span>
        <span>▸ PRICING</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
          <span style={{ color: 'var(--green)' }}>● SYSTEM OPERATIONAL</span>
          <span>{clock}</span>
        </div>
      </div>

      <div style={{ padding: '64px 40px', maxWidth: 1200, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-block',
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
            color: 'var(--red)', letterSpacing: 3,
            marginBottom: 16, padding: '4px 12px',
            border: '1px solid var(--red)33',
            background: 'var(--red)0a',
          }}>
            PRICING — SELECT PLAN
          </div>
          <h1 style={{
            fontFamily: 'var(--font-disp)', fontSize: 'clamp(40px,5vw,72px)',
            letterSpacing: 6, color: 'var(--text)', marginBottom: 12, lineHeight: 1,
          }}>
            BLOOMBERG AT 1%<br />OF THE PRICE
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-sec)', maxWidth: 480, margin: '0 auto 32px' }}>
            Bloomberg Terminal costs ~$24,000/year. WallSt Watch Pro is £2.99/month, Professional £7.99/month. Start free — no card required.
          </p>

          {/* VS callout */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 20,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 4, padding: '14px 24px', marginBottom: 36,
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 3 }}>BLOOMBERG TERMINAL</div>
              <div style={{ fontFamily: 'var(--font-disp)', fontSize: 26, color: 'var(--red)', letterSpacing: 2 }}>$2,000<span style={{ fontSize: 12 }}>/mo</span></div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)', fontWeight: 700 }}>VS</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 3 }}>WALLST WATCH PRO</div>
              <div style={{ fontFamily: 'var(--font-disp)', fontSize: 26, color: 'var(--green)', letterSpacing: 2 }}>£2.99<span style={{ fontSize: 12 }}>/mo</span></div>
            </div>
            <div style={{ background: 'var(--green)18', border: '1px solid var(--green)44', padding: '6px 12px', borderRadius: 3 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: 'var(--green)', letterSpacing: 1 }}>99.8% CHEAPER</div>
            </div>
          </div>

          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 1 }}>
            GBP · MONTHLY BILLING · TAX CALCULATED AT CHECKOUT (STRIPE TAX)
          </p>
        </div>

        {/* FOR INDIVIDUALS */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
            paddingBottom: 12, borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ width: 3, height: 18, background: 'var(--red)', borderRadius: 2 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 3 }}>FOR INDIVIDUALS</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {INDIVIDUAL_PLANS.map(plan => (
              <PlanCard key={plan.name} plan={plan} annual={annual} />
            ))}
          </div>
        </div>

        {/* FOR BUSINESS */}
        <div style={{ marginBottom: 80 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
            paddingBottom: 12, borderBottom: '1px solid var(--border)',
          }}>
            <div style={{ width: 3, height: 18, background: 'var(--amber)', borderRadius: 2 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 3 }}>FOR BUSINESS</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {BUSINESS_PLANS.map(plan => (
              <PlanCard key={plan.name} plan={plan} annual={annual} isBusiness />
            ))}
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ marginBottom: 80 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: 'var(--text-dim)', letterSpacing: 3, marginBottom: 24, textAlign: 'center',
          }}>
            FEATURE COMPARISON
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {/* Header row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
              <div style={{ padding: '12px 20px', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 2 }}>FEATURE</div>
              {['FREE', 'PRO', 'PROFESSIONAL', 'INSTITUTIONAL'].map(p => (
                <div key={p} style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, color: p === 'PRO' ? 'var(--red)' : p === 'PROFESSIONAL' ? 'var(--purple)' : 'var(--text-dim)', letterSpacing: 1, textAlign: 'center' }}>{p}</div>
              ))}
            </div>
            {[
              ['Live WebSocket prices',      false, true,  true,  true ],
              ['All 12 banks tracked',       false, true,  true,  true ],
              ['Insider transactions',       false, true,  true,  true ],
              ['Earnings calendar',          false, true,  true,  true ],
              ['Fed Watch & FOMC',           false, true,  true,  true ],
              ['AI research notes',          false, false, true,  true ],
              ['Options flow tracker',       false, false, true,  true ],
              ['Dark pool activity',         false, false, true,  true ],
              ['PDF report export',          false, false, true,  true ],
              ['API access',                 false, false, false, true ],
              ['Team seats',                 false, false, false, true ],
              ['Webhook alerts (Slack)',      false, false, false, true ],
            ].map(([label, ...vals], i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                borderBottom: i < 11 ? '1px solid var(--border)' : 'none',
                background: i % 2 === 0 ? 'transparent' : 'var(--bg-panel)11',
              }}>
                <div style={{ padding: '10px 20px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-sec)' }}>{label as string}</div>
                {(vals as boolean[]).map((v, j) => (
                  <div key={j} style={{ padding: '10px 16px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: v ? 'var(--green)' : 'var(--text-dim)' }}>
                    {v ? '✓' : '—'}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: 'var(--text-dim)', letterSpacing: 3, marginBottom: 24,
            paddingBottom: 12, borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{ width: 3, height: 18, background: 'var(--blue)', borderRadius: 2 }} />
            FREQUENTLY ASKED
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {FAQ.map((faq, i) => (
              <div key={i} style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 4, padding: '18px 20px',
                borderLeft: '2px solid var(--border-glow)',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: 0.5 }}>{faq.q}</div>
                <div style={{ fontSize: 12, color: 'var(--text-sec)', lineHeight: 1.8 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
