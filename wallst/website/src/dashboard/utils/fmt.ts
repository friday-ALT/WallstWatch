export function fmtNum(n: number | null | undefined, prefix = ''): string {
  if (n == null) return '—';
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${prefix}${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `${prefix}${(n / 1e9).toFixed(1)}B`;
  if (abs >= 1e6)  return `${prefix}${(n / 1e6).toFixed(0)}M`;
  if (abs >= 1e3)  return `${prefix}${(n / 1e3).toFixed(0)}K`;
  return `${prefix}${n.toFixed(2)}`;
}

export function fmtPct(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

export function fmtPrice(n: number | null | undefined): string {
  if (n == null) return '—';
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function upColor(val: number | null | undefined): string {
  if (val == null) return '#8b95a5';
  return val >= 0 ? '#00e676' : '#ff3b3b';
}
