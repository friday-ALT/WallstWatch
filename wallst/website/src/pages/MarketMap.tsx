import { useEffect, useState, useMemo } from 'react';
import { COMPANIES, MARKET_DEALS } from '../map/data/companies';
import { platform } from '../lib/api';
import type { MapEntity, MarketDeal } from '../map/data/companyTypes';
import type { MapHub } from '../map/utils/clusters';
import { companiesInHub } from '../map/utils/clusters';
import { useLiveQuotes } from '../dashboard/hooks/useLiveQuotes';
import { MapTickerBar } from '../map/components/MapTickerBar';
import { MapHeader } from '../map/components/MapHeader';
import { MapLeftPanel } from '../map/components/MapLeftPanel';
import { EntityDetailPanel } from '../map/components/EntityDetailPanel';
import { MapBottomBar } from '../map/components/MapBottomBar';
import { MarketGlobe, MapLayer } from '../map/components/MarketGlobe';
import { ClusterPicker } from '../map/components/ClusterPicker';
import '../styles/map.css';

const LAYERS: { id: MapLayer; label: string; pro?: boolean }[] = [
  { id: 'companies', label: 'All Companies' },
  { id: 'banks', label: 'Banking Radar' },
  { id: 'deals', label: 'Deal Flows' },
  { id: 'live', label: 'Live Quotes', pro: true },
  { id: 'regions', label: 'Region Risk' },
];

const TICKER_SYMS = ['JPM', 'GS', 'AAPL', 'MSFT', 'NVDA', 'SPY', 'QQQ', 'VIX', 'XLF', 'BABA', 'SHEL', 'SAP'];

export function MarketMap() {
  const [selected, setSelected] = useState<MapEntity | null>(
    COMPANIES.find(c => c.sym === 'JPM') ?? COMPANIES[0]
  );
  const [layer, setLayer] = useState<MapLayer>('companies');
  const [utc, setUtc] = useState('');
  const [reportCounts, setReportCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [focusHub, setFocusHub] = useState<MapHub | null>(null);
  const [selectedDeal, setSelectedDeal] = useState<MarketDeal | null>(null);
  const [deals, setDeals] = useState<MarketDeal[]>(MARKET_DEALS);
  const quotes = useLiveQuotes(TICKER_SYMS);

  useEffect(() => {
    platform.deals().then((d: MarketDeal[]) => setDeals(d.length ? d : MARKET_DEALS)).catch(() => {});
  }, []);

  useEffect(() => {
    const tick = () => setUtc(new Date().toUTCString().split(' ')[4] ?? '');
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (layer === 'deals' && !selectedDeal) {
      setSelectedDeal(deals[0] ?? null);
    }
    if (layer !== 'deals') setSelectedDeal(null);
  }, [layer]);

  useEffect(() => {
    const top = COMPANIES.filter(c => c.mktCapB > 20).slice(0, 40);
    Promise.all(
      top.map(async c => {
        try {
          const r = await fetch(`/api/news/${c.sym}`);
          const d = await r.json();
          return { sym: c.sym, count: Array.isArray(d) ? d.length : 0 };
        } catch {
          return { sym: c.sym, count: 0 };
        }
      })
    ).then(results => {
      const map: Record<string, number> = {};
      results.forEach(({ sym, count }) => { map[sym] = count + 6; });
      COMPANIES.forEach(c => {
        if (!map[c.sym]) map[c.sym] = 6 + (c.riskScore % 15);
      });
      setReportCounts(map);
    });
  }, []);

  const filteredSearch = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toUpperCase();
    return COMPANIES.find(c => c.sym.includes(q) || c.name.toUpperCase().includes(q));
  }, [search]);

  useEffect(() => {
    if (filteredSearch) {
      setSelected(filteredSearch);
      setFocusHub(null);
    }
  }, [filteredSearch?.sym]);

  const selectedReports = selected ? reportCounts[selected.sym] ?? 12 : 0;
  const hubCompanies = focusHub ? companiesInHub(focusHub, COMPANIES) : [];

  return (
    <div className="mm-root">
      <MapTickerBar quotes={quotes} />
      <MapHeader utc={utc} bankCount={COMPANIES.length} />

      <div className="mm-main">
        <MapLeftPanel />

        <section className="mm-center">
          <div className="mm-map-toolbar">
            {LAYERS.map(l => (
              <button
                key={l.id}
                type="button"
                className={`mm-layer-btn${layer === l.id ? ' active' : ''}${l.pro ? ' pro' : ''}`}
                onClick={() => setLayer(l.id)}
              >
                {l.label.toUpperCase()}
              </button>
            ))}
            <input
              className="mm-search-input"
              placeholder="Search ticker or company…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <MarketGlobe
            entities={COMPANIES}
            selected={selected}
            onSelect={setSelected}
            layer={layer}
            quotes={quotes}
            reportCounts={reportCounts}
            deals={deals}
            focusHub={focusHub}
            onFocusHub={setFocusHub}
            selectedDeal={selectedDeal}
            onSelectDeal={setSelectedDeal}
          />
        </section>

        <aside className="mm-right mm-right-scroll mm-right-stack">
          {focusHub && hubCompanies.length > 0 && (
            <ClusterPicker
              title={focusHub.label}
              companies={hubCompanies}
              selectedSym={selected?.sym}
              onPick={setSelected}
              onClose={() => setFocusHub(null)}
              variant="sidebar"
            />
          )}
          <EntityDetailPanel entity={selected} quotes={quotes} reportCount={selectedReports} />
        </aside>
      </div>

      <MapBottomBar deals={MARKET_DEALS} selected={selected} selectedDeal={selectedDeal} />
    </div>
  );
}
