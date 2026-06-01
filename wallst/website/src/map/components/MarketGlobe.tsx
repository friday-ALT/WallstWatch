import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Globe from 'react-globe.gl';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import { MapEntity, SECTOR_COLORS, riskColor, MarketDeal } from '../data/companyTypes';
import { Quote } from '../../dashboard/hooks/useLiveQuotes';
import { COMPANY_BY_SYM } from '../data/companies';
import {
  layoutDisplayPoints,
  clusterAtPoint,
  type MapHub,
  type DisplayPoint,
} from '../utils/clusters';
import { HubJumpBar } from './HubJumpBar';
import { ClusterPicker } from './ClusterPicker';
import { DealFlowPanel } from './DealFlowPanel';

export type MapLayer = 'companies' | 'banks' | 'deals' | 'live' | 'regions';

type GlobePoint = DisplayPoint & { color: string; size: number; reportCount: number };

interface Props {
  entities: MapEntity[];
  selected: MapEntity | null;
  onSelect: (e: MapEntity | null) => void;
  layer: MapLayer;
  quotes: Record<string, Quote>;
  reportCounts: Record<string, number>;
  deals: MarketDeal[];
  focusHub: MapHub | null;
  onFocusHub: (hub: MapHub | null) => void;
  selectedDeal: MarketDeal | null;
  onSelectDeal: (deal: MarketDeal | null) => void;
}

const CHOKEPOINTS = [
  { name: 'Wall Street', lat: 40.7074, lng: -74.0113, color: '#ff3b3b' },
  { name: 'Silicon Valley', lat: 37.3875, lng: -122.0575, color: '#2196f3' },
  { name: 'City of London', lat: 51.5138, lng: -0.0984, color: '#2196f3' },
  { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, color: '#ffc107' },
  { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, color: '#00e676' },
];

export function MarketGlobe({
  entities, selected, onSelect, layer, quotes, reportCounts, deals,
  focusHub, onFocusHub, selectedDeal, onSelectDeal,
}: Props) {
  const globeRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 800, h: 500 });
  const [countries, setCountries] = useState<object[]>([]);
  const [clusterPick, setClusterPick] = useState<{ title: string; companies: MapEntity[] } | null>(null);

  useEffect(() => {
    fetch('https://unpkg.com/world-atlas/countries-110m.json')
      .then(r => r.json())
      .then((topo: Topology) => {
        const geo = feature(topo, topo.objects.countries as Parameters<typeof feature>[1]);
        const feats = (geo as { type: string; features?: object[] }).features;
        if (feats) setCountries(feats);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setDims({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setDims({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    if (focusHub) {
      g.pointOfView({ lat: focusHub.lat, lng: focusHub.lng, altitude: focusHub.altitude }, 1400);
    }
  }, [focusHub?.id]);

  useEffect(() => {
    const g = globeRef.current;
    if (!g || !selected || focusHub) return;
    g.pointOfView({ lat: selected.lat, lng: selected.lng, altitude: 0.65 }, 1200);
  }, [selected?.sym, focusHub?.id]);

  useEffect(() => {
    if (!selectedDeal) return;
    const from = COMPANY_BY_SYM[selectedDeal.fromSym];
    const to = COMPANY_BY_SYM[selectedDeal.toSym];
    const g = globeRef.current;
    if (!g || !from || !to) return;
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    g.pointOfView({ lat: midLat, lng: midLng, altitude: 1.8 }, 1200);
  }, [selectedDeal?.id]);

  const filtered = useMemo(() => {
    if (layer === 'banks') return entities.filter(e => e.sector === 'Banking');
    return entities;
  }, [entities, layer]);

  const displayed = useMemo(
    () => layoutDisplayPoints(filtered, focusHub),
    [filtered, focusHub]
  );

  const countryRisk = useMemo(() => {
    const map: Record<string, number[]> = {};
    entities.forEach(e => {
      if (!map[e.iso]) map[e.iso] = [];
      map[e.iso].push(e.riskScore);
    });
    const avg: Record<string, number> = {};
    Object.entries(map).forEach(([iso, scores]) => {
      avg[iso] = scores.reduce((a, b) => a + b, 0) / scores.length;
    });
    return avg;
  }, [entities]);

  const points: GlobePoint[] = useMemo(
    () =>
      displayed.map(e => {
        const isDealParty = selectedDeal && (e.sym === selectedDeal.fromSym || e.sym === selectedDeal.toSym);
        return {
          ...e,
          color: isDealParty ? '#ffffff' : layer === 'regions' ? riskColor(e.risk) : SECTOR_COLORS[e.sector],
          size: Math.max(0.2, Math.min(0.85, Math.log10(e.mktCapB + 1) * 0.14)) * (focusHub ? 1.35 : 1),
          reportCount: reportCounts[e.sym] ?? 8 + (e.riskScore % 12),
        };
      }),
    [displayed, layer, reportCounts, focusHub, selectedDeal]
  );

  const arcs = useMemo(() => {
    const showDeals = layer === 'deals' || selectedDeal;
    if (!showDeals) return [] as object[];
    const list = selectedDeal ? [selectedDeal] : deals;
    return list
      .map(d => {
        const from = COMPANY_BY_SYM[d.fromSym];
        const to = COMPANY_BY_SYM[d.toSym];
        if (!from || !to) return null;
        const highlighted = selectedDeal?.id === d.id;
        return {
          ...d,
          startLat: from.lat,
          startLng: from.lng,
          endLat: to.lat,
          endLng: to.lng,
          color: highlighted
            ? ['#ffffff', '#ff3b3b']
            : d.status === 'ACTIVE'
              ? ['#ff3b3bee', '#00e676cc']
              : d.status === 'PENDING'
                ? ['#ffc107ee', '#ffc10788']
                : ['#8b95a5aa', '#8b95a544'],
          stroke: highlighted ? 1.4 : 0.7,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null);
  }, [deals, layer, selectedDeal]);

  const dealLabels = useMemo(() => {
    if (layer !== 'deals' && !selectedDeal) return [];
    return arcs.map((a: any) => ({
      lat: (a.startLat + a.endLat) / 2,
      lng: (a.startLng + a.endLng) / 2,
      text: `${a.fromSym}→${a.toSym} $${a.valueB}B`,
      dealId: a.id,
    }));
  }, [arcs, layer, selectedDeal]);

  const handlePointClick = useCallback(
    (p: object) => {
      const pt = p as GlobePoint;
      const nearby = clusterAtPoint(filtered, pt.lat, pt.lng, focusHub ? 0.25 : 0.45);
      if (!focusHub && nearby.length > 4) {
        setClusterPick({
          title: pt.city || 'Cluster',
          companies: nearby.sort((a, b) => b.mktCapB - a.mktCapB),
        });
        return;
      }
      if (focusHub && nearby.length > 1) {
        const exact = nearby.find(c => c.sym === pt.sym);
        if (exact) {
          onSelect(selected?.sym === exact.sym ? null : exact);
          return;
        }
      }
      onSelect(selected?.sym === pt.sym ? null : pt);
      setClusterPick(null);
    },
    [filtered, focusHub, onSelect, selected?.sym]
  );

  const handleArcClick = useCallback(
    (a: object) => {
      const arc = a as MarketDeal;
      onSelectDeal(selectedDeal?.id === arc.id ? null : arc);
      const from = COMPANY_BY_SYM[arc.fromSym];
      if (from) onSelect(from);
    },
    [onSelect, onSelectDeal, selectedDeal?.id]
  );

  const pointLabel = useCallback((p: object) => {
    const d = p as GlobePoint;
    const q = quotes[d.sym];
    const chg = q ? `${q.dp >= 0 ? '+' : ''}${q.dp.toFixed(2)}%` : '';
    return `
      <div style="background:linear-gradient(135deg,#0f1216,#1a2030);border:1px solid ${d.color}88;padding:12px 16px;font-family:monospace;color:#e8eaed;border-radius:6px;min-width:180px;box-shadow:0 8px 32px rgba(0,0,0,0.5)">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="color:${d.color};font-weight:700;font-size:9px;letter-spacing:2px">${d.risk}</span>
          <span style="color:#4a5568;font-size:8px">${d.reportCount} REPORTS</span>
        </div>
        <div style="font-size:16px;font-weight:700;color:#fff">${d.sym}</div>
        <div style="color:#8b95a5;font-size:10px;margin:4px 0">${d.name}</div>
        <div style="color:${d.color};font-size:9px;letter-spacing:1px">${d.sector.toUpperCase()}</div>
        ${q ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #2a3040;font-size:11px"><span style="color:#fff">$${q.c.toFixed(2)}</span> <span style="color:${q.dp >= 0 ? '#00e676' : '#ff3b3b'}">${chg}</span></div>` : ''}
        <div style="color:#4a5568;font-size:8px;margin-top:6px">${d.city}, ${d.country}</div>
        ${focusHub ? '' : '<div style="color:#ffc107;font-size:8px;margin-top:6px">Tip: use ZOOM HUB for dense areas</div>'}
      </div>
    `;
  }, [quotes, focusHub]);

  const polygonCapColor = useCallback((feat: object) => {
    const f = feat as { properties?: { iso_a2?: string } };
    const iso = f.properties?.iso_a2 ?? '';
    const risk = countryRisk[iso];
    if (risk == null) return 'rgba(20,24,32,0.92)';
    if (risk >= 60) return 'rgba(255,59,59,0.35)';
    if (risk >= 45) return 'rgba(255,193,7,0.28)';
    if (risk >= 30) return 'rgba(255,109,0,0.2)';
    return 'rgba(0,230,118,0.18)';
  }, [countryRisk]);

  return (
    <div ref={containerRef} className="mm-globe-wrap">
      <Globe
        ref={globeRef}
        width={dims.w}
        height={dims.h}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        atmosphereColor="#4a90d9"
        atmosphereAltitude={0.2}
        polygonsData={layer === 'regions' ? countries : []}
        polygonCapColor={polygonCapColor}
        polygonSideColor={() => 'rgba(0,0,0,0.15)'}
        polygonStrokeColor={() => 'rgba(255,255,255,0.06)'}
        polygonAltitude={0.012}
        pointsData={points}
        pointLat="displayLat"
        pointLng="displayLng"
        pointColor="color"
        pointAltitude={(d: object) => {
          const p = d as GlobePoint;
          const dealParty = selectedDeal && (p.sym === selectedDeal.fromSym || p.sym === selectedDeal.toSym);
          if (dealParty) return 0.35;
          return selected?.sym === p.sym ? p.size * 0.55 : p.size * 0.3;
        }}
        pointRadius={(d: object) => {
          const p = d as GlobePoint;
          const dealParty = selectedDeal && (p.sym === selectedDeal.fromSym || p.sym === selectedDeal.toSym);
          if (dealParty) return p.size * 1.5;
          return selected?.sym === p.sym ? p.size * 1.35 : p.size * (focusHub ? 1.1 : 0.85);
        }}
        pointsMerge={false}
        pointLabel={pointLabel}
        onPointClick={handlePointClick}
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor="color"
        arcDashLength={(d: object) => ((d as { stroke?: number }).stroke ?? 0.7) > 1 ? 0.15 : 0.35}
        arcDashGap={0.1}
        arcDashAnimateTime={1200}
        arcStroke={(d: object) => (d as { stroke?: number }).stroke ?? 0.7}
        arcAltitude={0.35}
        onArcClick={handleArcClick}
        arcLabel={(d: object) => {
          const a = d as MarketDeal;
          return `<div style="background:#0f1216;border:1px solid #ff3b3b;padding:6px 10px;font-family:monospace;font-size:10px;color:#fff;border-radius:4px">${a.type}: ${a.label}<br/><span style="color:#ffc107">$${a.valueB}B</span></div>`;
        }}
        ringsData={layer === 'deals' || layer === 'live' ? CHOKEPOINTS : []}
        ringLat="lat"
        ringLng="lng"
        ringColor={(d: object) => (d as { color: string }).color + '66'}
        ringMaxRadius={focusHub ? 1.2 : 2.5}
        ringPropagationSpeed={2.5}
        ringRepeatPeriod={900}
        labelsData={layer === 'live' ? points.filter(p => p.mktCapB > 50).slice(0, 40) : dealLabels}
        labelLat="lat"
        labelLng="lng"
        labelText={(d: object) => {
          const any = d as { sym?: string; text?: string };
          if (any.text) return any.text;
          const p = d as GlobePoint;
          const q = quotes[p.sym];
          return q ? `${p.sym} $${q.c.toFixed(0)}` : p.sym;
        }}
        labelSize={(d: object) => ((d as { text?: string }).text ? 0.9 : 0.6)}
        labelColor={() => '#ffc107'}
        labelDotRadius={0.15}
        labelAltitude={0.05}
      />

      <HubJumpBar activeHubId={focusHub?.id ?? null} onJump={h => { onFocusHub(h); setClusterPick(null); }} />

      {clusterPick && (
        <ClusterPicker
          title={clusterPick.title}
          companies={clusterPick.companies}
          selectedSym={selected?.sym}
          onPick={c => { onSelect(c); setClusterPick(null); }}
          onClose={() => setClusterPick(null)}
        />
      )}

      {(layer === 'deals' || selectedDeal) && (
        <DealFlowPanel
          deals={deals}
          selectedDealId={selectedDeal?.id ?? null}
          onSelectDeal={d => {
            onSelectDeal(d);
            if (d) {
              const from = COMPANY_BY_SYM[d.fromSym];
              if (from) onSelect(from);
            }
          }}
        />
      )}

      {focusHub && (
        <div className="mm-focus-banner">
          ◆ ZOOMED: {focusHub.label.toUpperCase()} — pins spread for selection
        </div>
      )}

      <div className="mm-globe-legend">
        {Object.entries(SECTOR_COLORS).slice(0, 6).map(([sec, col]) => (
          <span key={sec}><i style={{ background: col }} />{sec}</span>
        ))}
      </div>
    </div>
  );
}
