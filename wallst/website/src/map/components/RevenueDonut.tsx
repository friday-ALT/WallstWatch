interface Slice { label: string; pct: number; color: string }

export function RevenueDonut({ slices, title }: { slices: Slice[]; title: string }) {
  let acc = 0;
  const gradient = slices
    .map(s => {
      const start = acc;
      acc += s.pct;
      return `${s.color} ${start}% ${acc}%`;
    })
    .join(', ');

  return (
    <div className="mm-donut-block">
      <div className="mm-donut-title">{title}</div>
      <div className="mm-donut-row">
        <div className="mm-donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
          <div className="mm-donut-hole" />
        </div>
        <div className="mm-donut-legend">
          {slices.map(s => (
            <div key={s.label} className="mm-donut-legend-item">
              <span className="mm-donut-dot" style={{ background: s.color }} />
              <span className="mm-donut-lbl">{s.label}</span>
              <span className="mm-donut-pct">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
