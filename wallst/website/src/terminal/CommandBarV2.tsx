import { useState, useEffect, useRef, useMemo } from 'react';
import { useTerminal } from './TerminalProvider';

const TABS: Record<string, string> = {
  BRIEF: 'brief', CHART: 'charts', CHARTS: 'charts', MACRO: 'macro', FX: 'fx',
  SCREENER: 'screener', BANKS: 'banks', CREDIT: 'credit', INSIDER: 'insider',
  EARN: 'earnings', EARNINGS: 'earnings', FED: 'fed', OPTIONS: 'options',
  PORTFOLIO: 'portfolio', WATCHLIST: 'watchlist', ALERTS: 'alerts',
  RESEARCH: 'research', DARKPOOL: 'darkpool', DEALS: 'deals', NEWS: 'news',
  CALENDAR: 'calendar', REG: 'regulatory', TEAMS: 'teams', WORKSPACE: 'workspace',
  MAP: 'map',
};

interface Props {
  onTab?: (tab: string) => void;
  onMap?: () => void;
}

export function CommandBarV2({ onTab, onMap }: Props) {
  const { goEquity, setSymbol } = useTerminal();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toUpperCase();
    const items: { label: string; action: () => void }[] = [];
    if (!q) {
      Object.entries(TABS).slice(0, 12).forEach(([cmd, tab]) => {
        items.push({ label: `${cmd} — open tab`, action: () => { onTab?.(tab); setOpen(false); } });
      });
      items.push({ label: 'MAP — market map', action: () => { onMap?.(); setOpen(false); } });
      return items;
    }
    const equityMatch = q.match(/^([A-Z.]{1,6})(\s+US\s+EQUITY)?$/);
    if (equityMatch) {
      items.push({ label: `${equityMatch[1]} US EQUITY — security overview`, action: () => { goEquity(equityMatch[1]); setOpen(false); } });
      items.push({ label: `CHART ${equityMatch[1]}`, action: () => { setSymbol(equityMatch[1]); onTab?.('charts'); setOpen(false); } });
      items.push({ label: `NEWS ${equityMatch[1]}`, action: () => { setSymbol(equityMatch[1]); onTab?.('news'); setOpen(false); } });
    }
    Object.entries(TABS).forEach(([cmd, tab]) => {
      if (cmd.includes(q) || tab.includes(q.toLowerCase())) {
        items.push({ label: cmd, action: () => { onTab?.(tab); setOpen(false); } });
      }
    });
    if (q.length <= 5 && /^[A-Z.]+$/.test(q)) {
      items.unshift({ label: `${q} — quick equity lookup`, action: () => { goEquity(q); setOpen(false); } });
    }
    return items.slice(0, 10);
  }, [query, goEquity, setSymbol, onTab, onMap]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); setQuery(''); }
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'g' && !open && !(e.target as HTMLElement)?.matches('input,textarea')) {
        const t = (e.target as HTMLElement)?.tagName;
        if (t !== 'INPUT' && t !== 'TEXTAREA') { e.preventDefault(); setOpen(true); setQuery(''); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  return (
    <>
      <button className="dc-cmd-trigger" onClick={() => { setOpen(true); setQuery(''); }} title="⌘K or G">
        ⌘K COMMAND
      </button>
      {open && (
        <div className="dc-cmd-overlay" onClick={() => setOpen(false)}>
          <div className="dc-cmd-modal" onClick={e => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="dc-cmd-input"
              placeholder="Ticker (AAPL US EQUITY), tab name, or MAP..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && suggestions[0]) { suggestions[0].action(); }
              }}
            />
            <div className="dc-cmd-list">
              {suggestions.map((s, i) => (
                <button key={i} type="button" className="dc-cmd-item" onClick={s.action}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="dc-cmd-hint">G open · ⌘K search · ? help in dashboard</div>
          </div>
        </div>
      )}
    </>
  );
}
