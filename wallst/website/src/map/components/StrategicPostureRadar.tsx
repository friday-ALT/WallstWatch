import { MapEntity } from '../data/companyTypes';

const AXES: { key: keyof MapEntity['posture']; label: string }[] = [
  { key: 'creditStrength', label: 'Credit' },
  { key: 'growthMomentum', label: 'Growth' },
  { key: 'regulatoryRisk', label: 'Regulatory' },
  { key: 'marketSentiment', label: 'Sentiment' },
  { key: 'geoExposure', label: 'Geo Risk' },
];

interface Props {
  entity: MapEntity;
  size?: number;
}

export function StrategicPostureRadar({ entity, size = 160 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const n = AXES.length;

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;

  const point = (i: number, val: number) => {
    const r = (val / 100) * maxR;
    return { x: cx + r * Math.cos(angle(i)), y: cy + r * Math.sin(angle(i)) };
  };

  const gridLevels = [25, 50, 75, 100];
  const dataPoints = AXES.map((a, i) => point(i, entity.posture[a.key]));
  const pathD = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <div className="mm-radar-wrap">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {gridLevels.map(lvl => (
          <polygon
            key={lvl}
            points={AXES.map((_, i) => {
              const p = point(i, lvl);
              return `${p.x},${p.y}`;
            }).join(' ')}
            fill="none"
            stroke="var(--border-glow)"
            strokeWidth={0.5}
          />
        ))}
        {AXES.map((_, i) => {
          const p = point(i, 100);
          return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border)" strokeWidth={0.5} />;
        })}
        <path d={pathD} fill="rgba(255,59,59,0.25)" stroke="#ff3b3b" strokeWidth={1.5} />
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="#ff3b3b" />
        ))}
      </svg>
      <div className="mm-radar-labels">
        {AXES.map(a => (
          <span key={a.key}>{a.label}</span>
        ))}
      </div>
    </div>
  );
}
