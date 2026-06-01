import { useEffect, useState } from 'react';

const HELP = [
  ['⌘K / G', 'Command launcher'],
  ['1–6', 'Jump market tabs (brief, charts, macro, fx, screener, news)'],
  ['M', 'Market map'],
  ['E', 'Equity page for active symbol'],
  ['?', 'Toggle this help'],
];

interface Props { onTab: (t: string) => void; onMap: () => void; onEquity: () => void; }

export function KeyboardShortcuts({ onTab, onMap, onEquity }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '?') { e.preventDefault(); setShow(s => !s); return; }
      if (e.key === 'm' || e.key === 'M') { onMap(); return; }
      if (e.key === 'e' || e.key === 'E') { onEquity(); return; }
      const num = parseInt(e.key, 10);
      const tabs = ['brief', 'charts', 'macro', 'fx', 'screener', 'news'];
      if (num >= 1 && num <= 6) onTab(tabs[num - 1]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onTab, onMap, onEquity]);

  if (!show) return null;
  return (
    <div className="dc-shortcuts-overlay" onClick={() => setShow(false)}>
      <div className="dc-shortcuts-panel" onClick={e => e.stopPropagation()}>
        <div className="dc-section-label">KEYBOARD SHORTCUTS</div>
        {HELP.map(([k, d]) => (
          <div key={k} className="dc-shortcut-row">
            <kbd>{k}</kbd><span>{d}</span>
          </div>
        ))}
        <button type="button" onClick={() => setShow(false)}>CLOSE</button>
      </div>
    </div>
  );
}
