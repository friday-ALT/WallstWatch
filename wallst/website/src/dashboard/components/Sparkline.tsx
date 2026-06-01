import { useEffect, useState } from 'react';

interface Props { symbol: string; color?: string; width?: number; height?: number; }

export function Sparkline({ symbol, color, width = 80, height = 28 }: Props) {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/candles/${symbol}?resolution=D&days=7`)
      .then(r => r.json())
      .then(d => { if (d.c?.length) setPoints(d.c); })
      .catch(() => {});
  }, [symbol]);

  if (points.length < 2) {
    return <div style={{ width, height, background: '#ffffff08', borderRadius: 2 }} />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const trend = points[points.length - 1] >= points[0];
  const lineColor = color ?? (trend ? '#00e676' : '#ff3b3b');
  const w = width; const h = height;
  const step = w / (points.length - 1);

  const coords = points.map((p, i) => `${i * step},${h - ((p - min) / range) * (h - 4) - 2}`);
  const polyline = coords.join(' ');
  const fillPath = `M${coords[0]} L${coords.join(' L')} L${(points.length-1)*step},${h} L0,${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id={`sg-${symbol}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${symbol})`} />
      <polyline points={polyline} fill="none" stroke={lineColor} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
