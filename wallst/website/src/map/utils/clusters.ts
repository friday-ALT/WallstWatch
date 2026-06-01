import type { MapEntity } from '../data/companyTypes';

export interface MapHub {
  id: string;
  label: string;
  lat: number;
  lng: number;
  /** Zoom altitude — lower = closer */
  altitude: number;
  match: (e: MapEntity) => boolean;
}

export const MAP_HUBS: MapHub[] = [
  {
    id: 'sf',
    label: 'Silicon Valley',
    lat: 37.7749,
    lng: -122.4194,
    altitude: 0.45,
    match: e => e.lat >= 37.2 && e.lat <= 38.3 && e.lng >= -123.2 && e.lng <= -121.4,
  },
  {
    id: 'nyc',
    label: 'Wall Street',
    lat: 40.7128,
    lng: -74.006,
    altitude: 0.45,
    match: e => e.city === 'New York',
  },
  {
    id: 'lon',
    label: 'City of London',
    lat: 51.5074,
    lng: -0.1278,
    altitude: 0.5,
    match: e => e.city === 'London',
  },
  {
    id: 'hk',
    label: 'Hong Kong',
    lat: 22.3193,
    lng: 114.1694,
    altitude: 0.55,
    match: e => e.city === 'Hong Kong' || e.city === 'Shenzhen',
  },
  {
    id: 'tk',
    label: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    altitude: 0.55,
    match: e => e.city === 'Tokyo',
  },
  {
    id: 'fra',
    label: 'Frankfurt',
    lat: 50.1109,
    lng: 8.6821,
    altitude: 0.55,
    match: e => e.city === 'Frankfurt' || e.city === 'Zurich' || e.city === 'Paris',
  },
];

export type DisplayPoint = MapEntity & { displayLat: number; displayLng: number; clusterId: string };

function distDeg(a: MapEntity, b: MapEntity) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

/** Group entities that sit on top of each other (within ~0.35°) */
export function buildClusters(entities: MapEntity[]): MapEntity[][] {
  const used = new Set<string>();
  const clusters: MapEntity[][] = [];
  for (const e of entities) {
    if (used.has(e.sym)) continue;
    const group = entities.filter(o => !used.has(o.sym) && distDeg(e, o) < 0.35);
    group.forEach(g => used.add(g.sym));
    clusters.push(group);
  }
  return clusters;
}

export function clusterAtPoint(entities: MapEntity[], lat: number, lng: number, radius = 0.5): MapEntity[] {
  return entities.filter(e => Math.hypot(e.lat - lat, e.lng - lng) < radius);
}

/** Spread overlapping pins in a ring when a hub is focused or cluster is large */
export function layoutDisplayPoints(
  entities: MapEntity[],
  focusHub: MapHub | null
): DisplayPoint[] {
  if (!focusHub) {
    return entities.map(e => ({
      ...e,
      displayLat: e.lat,
      displayLng: e.lng,
      clusterId: e.city,
    }));
  }

  const inHub = entities.filter(focusHub.match);
  const outHub = entities.filter(e => !focusHub.match(e));
  const spread = spreadInRing(inHub, focusHub.lat, focusHub.lng, 0.12 + inHub.length * 0.004);

  return [
    ...spread,
    ...outHub.map(e => ({ ...e, displayLat: e.lat, displayLng: e.lng, clusterId: e.city })),
  ];
}

function spreadInRing(items: MapEntity[], cLat: number, cLng: number, radiusDeg: number): DisplayPoint[] {
  if (items.length <= 1) {
    return items.map(e => ({ ...e, displayLat: e.lat, displayLng: e.lng, clusterId: e.city }));
  }
  return items.map((e, i) => {
    const angle = (2 * Math.PI * i) / items.length - Math.PI / 2;
    const r = radiusDeg * (0.85 + (e.mktCapB > 100 ? 0.15 : 0));
    const cosLat = Math.cos((cLat * Math.PI) / 180);
    return {
      ...e,
      displayLat: cLat + r * Math.cos(angle),
      displayLng: cLng + (r * Math.sin(angle)) / cosLat,
      clusterId: e.city,
    };
  });
}

export function companiesInHub(hub: MapHub, entities: MapEntity[]) {
  return entities.filter(hub.match).sort((a, b) => b.mktCapB - a.mktCapB);
}
