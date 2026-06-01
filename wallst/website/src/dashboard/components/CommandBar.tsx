import { useState, useEffect, useRef } from 'react';

const COMMANDS = [
  { cmd: 'JPM US EQUITY',   label: 'JPMorgan Chase — Bank Map',   action: 'bank:JPM' },
  { cmd: 'GS US EQUITY',    label: 'Goldman Sachs — Bank Map',    action: 'bank:GS' },
  { cmd: 'MS US EQUITY',    label: 'Morgan Stanley — Bank Map',   action: 'bank:MS' },
  { cmd: 'BAC US EQUITY',   label: 'Bank of America — Bank Map',  action: 'bank:BAC' },
  { cmd: 'C US EQUITY',     label: 'Citigroup — Bank Map',        action: 'bank:C' },
  { cmd: 'WFC US EQUITY',   label: 'Wells Fargo — Bank Map',      action: 'bank:WFC' },
  { cmd: 'BRIEF',           label: 'Daily Brief — Morning Report', action: 'tab:brief' },
  { cmd: 'CHART',           label: 'Charts — TradingView',         action: 'tab:charts' },
  { cmd: 'FX',              label: 'FX & Fixed Income Dashboard',  action: 'tab:fx' },
  { cmd: 'EARN',            label: 'Earnings Calendar',            action: 'tab:earnings' },
  { cmd: 'INSIDER',         label: 'Insider Transactions',         action: 'tab:insider' },
  { cmd: 'FED',             label: 'Fed Watch & FOMC',             action: 'tab:fed' },
  { cmd: 'CREDIT',          label: 'Credit System Health',         action: 'tab:credit' },
  { cmd: 'MACRO',           label: 'Macro Dashboard',              action: 'tab:macro' },
  { cmd: 'COMPARE',         label: 'Peer Comparison Tool',         action: 'tab:compare' },
  { cmd: 'BANKS',           label: 'Bank Intelligence Grid',       action: 'tab:banks' },
];

interface Props {
  onAction: (action: string) => void;
}

export function CommandBar({ onAction }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.length > 0
    ? COMMANDS.filter(c => c.cmd.toLowerCase().includes(query.toLowerCase()) || c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); setQuery(''); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 50); }, [open]);

  const select = (action: string) => { onAction(action); setOpen(false); setQuery(''); };

  return (
    <>
      <button className="dc-cmd-trigger" onClick={() => { setOpen(true); setQuery(''); }} title="⌘K">
        <span className="dc-cmd-icon">⌘</span>
        <span className="dc-cmd-label">SEARCH</span>
        <span className="dc-cmd-shortcut">⌘K</span>
      </button>

      {open && (
        <div className="dc-cmd-overlay" onClick={() => setOpen(false)}>
          <div className="dc-cmd-modal" onClick={e => e.stopPropagation()}>
            <div className="dc-cmd-input-wrap">
              <span className="dc-cmd-prompt">{'>'}</span>
              <input
                ref={inputRef}
                className="dc-cmd-input"
                placeholder="Type a command or ticker... (e.g. JPM US EQUITY, CHART, FED)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && filtered.length > 0) select(filtered[0].action); }}
              />
              <button className="dc-cmd-esc" onClick={() => setOpen(false)}>ESC</button>
            </div>
            <div className="dc-cmd-results">
              {filtered.map(c => (
                <button key={c.action} className="dc-cmd-result" onClick={() => select(c.action)}>
                  <span className="dc-cmd-result-cmd">{c.cmd}</span>
                  <span className="dc-cmd-result-label">{c.label}</span>
                  <span className="dc-cmd-result-arrow">→</span>
                </button>
              ))}
            </div>
            <div className="dc-cmd-footer">
              <span>↑↓ navigate</span><span>↵ select</span><span>ESC close</span>
              <span style={{ marginLeft: 'auto', color: 'var(--red)' }}>◆ WALLST WATCH COMMAND TERMINAL</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
