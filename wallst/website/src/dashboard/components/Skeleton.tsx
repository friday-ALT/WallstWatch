interface Props { width?: string | number; height?: number; rows?: number; gap?: number; }

export function Skeleton({ width = '100%', height = 14, rows = 1, gap = 10 }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          width: typeof width === 'number' ? width : (i === rows - 1 && rows > 1 ? '60%' : width),
          height,
          background: 'linear-gradient(90deg, #1e2530 25%, #2a3040 50%, #1e2530 75%)',
          backgroundSize: '200% 100%',
          borderRadius: 3,
          animation: 'shimmer 1.5s infinite',
        }} />
      ))}
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid #1e2530', alignItems: 'center' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? 60 : i === 1 ? 100 : 80} height={12} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ background: '#141820', border: '1px solid #1e2530', borderRadius: 4, padding: 14 }}>
      <Skeleton height={10} width="40%" />
      <div style={{ height: 8 }} />
      <Skeleton height={22} width="60%" />
      <div style={{ height: 10 }} />
      <Skeleton height={10} rows={3} gap={6} />
    </div>
  );
}
