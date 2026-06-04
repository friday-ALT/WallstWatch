import { Quote } from '../hooks/useLiveQuotes';
import type { MarketTheme } from '../data/marketThemes';

function fmtPrice(sym: string, c?: number) {
  if (c == null) return '—';
  if (sym === 'VIX') return c.toFixed(2);
  return `$${c.toFixed(2)}`;
}

export function ThemeBucketCard({
  theme,
  quotes,
}: {
  theme: MarketTheme;
  quotes: Record<string, Quote>;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '14px 16px',
        marginBottom: 12,
      }}
    >
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
        {theme.title}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', marginBottom: 10, letterSpacing: 0.5 }}>
        {theme.subtitle.toUpperCase()}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 72px 56px 58px',
          gap: 4,
          paddingBottom: 6,
          marginBottom: 4,
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          fontWeight: 700,
          color: 'var(--text-dim)',
          letterSpacing: 1,
        }}
      >
        <span>SYMBOL</span>
        <span style={{ textAlign: 'right' }}>LAST</span>
        <span style={{ textAlign: 'right' }}>CHG</span>
        <span style={{ textAlign: 'right' }}>%</span>
      </div>

      {theme.symbols.map((item) => {
        const q = quotes[item.sym];
        const up = (q?.dp ?? 0) >= 0;
        const tint = up ? '#00e676' : '#ff3b3b';
        return (
          <div
            key={item.sym}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 72px 56px 58px',
              gap: 4,
              alignItems: 'center',
              padding: '9px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                {item.sym}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)' }}>{item.label}</div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, textAlign: 'right', color: 'var(--text)' }}>
              {fmtPrice(item.sym, q?.c)}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textAlign: 'right', color: tint }}>
              {q?.d != null ? `${up ? '+' : ''}${q.d.toFixed(2)}` : '—'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, textAlign: 'right', color: tint }}>
              {q?.dp != null ? `${up ? '+' : ''}${q.dp.toFixed(2)}%` : '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
