import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { platform } from '../../lib/api';
import { useTerminal } from '../../terminal/TerminalProvider';
import { useLiveQuotes } from '../hooks/useLiveQuotes';
import { ChartsView } from './ChartsView';
import { NewsIntelView } from './NewsIntelView';
import { ProGate } from '../components/ProGate';

type PanelId = 'quote' | 'chart' | 'news' | 'watchlist';

const DEFAULT_PANELS: PanelId[] = ['quote', 'chart', 'news', 'watchlist'];

export function WorkspaceView() {
  const { token } = useAuth();
  const { symbol } = useTerminal();
  const quotes = useLiveQuotes([symbol]);
  const [panels, setPanels] = useState<PanelId[]>(DEFAULT_PANELS);
  const [layouts, setLayouts] = useState<any[]>([]);
  const q = quotes[symbol];

  useEffect(() => {
    if (token) platform.layouts(token).then(setLayouts).catch(() => {});
  }, [token]);

  const saveLayout = async () => {
    if (!token) return;
    await platform.saveLayout(token, { name: `Layout ${layouts.length + 1}`, panels });
    platform.layouts(token).then(setLayouts);
  };

  const loadLayout = (l: any) => {
    try { setPanels(JSON.parse(l.panels)); } catch { /* ignore */ }
  };

  return (
    <div className="dc-scroll-area">
      <ProGate feature="Multi-panel workspace" requiredPlan="professional">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="dc-section-label" style={{ margin: 0 }}>WORKSPACE — {symbol}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button type="button" className="dc-sym-chip" onClick={saveLayout}>SAVE LAYOUT</button>
            {layouts.map(l => (
              <button key={l.id} type="button" className="dc-sym-chip" onClick={() => loadLayout(l)}>{l.name}</button>
            ))}
          </div>
        </div>
        <div className="dc-workspace-grid">
          {panels.includes('quote') && (
            <div className="dc-workspace-panel">
              <div className="dc-panel-title">QUOTE</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: (q?.dp ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                ${q?.c?.toFixed(2) ?? '—'}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{q ? `${q.dp >= 0 ? '+' : ''}${q.dp.toFixed(2)}%` : ''}</div>
            </div>
          )}
          {panels.includes('chart') && (
            <div className="dc-workspace-panel wide">
              <div className="dc-panel-title">CHART</div>
              <ChartsView />
            </div>
          )}
          {panels.includes('news') && (
            <div className="dc-workspace-panel">
              <NewsIntelView />
            </div>
          )}
        </div>
      </ProGate>
    </div>
  );
}
