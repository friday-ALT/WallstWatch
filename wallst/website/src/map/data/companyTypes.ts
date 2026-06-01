export type Sector =
  | 'Banking' | 'Technology' | 'Healthcare' | 'Energy' | 'Industrials'
  | 'Consumer' | 'Materials' | 'Utilities' | 'Real Estate' | 'Telecom';

export type RiskLevel = 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface MapEntity {
  sym: string;
  name: string;
  sector: Sector;
  lat: number;
  lng: number;
  city: string;
  country: string;
  iso: string;
  risk: RiskLevel;
  riskScore: number;
  mktCapB: number;
  /** Strategic posture axes 0–100 */
  posture: {
    creditStrength: number;
    growthMomentum: number;
    regulatoryRisk: number;
    marketSentiment: number;
    geoExposure: number;
  };
  revenueMix: { label: string; pct: number; color: string }[];
  debtToGdp?: number;
  grossDebtB?: number;
  regulatoryNote: string;
  debrief: string;
}

export interface MarketDeal {
  id: string;
  fromSym: string;
  toSym: string;
  type: 'M&A' | 'PARTNERSHIP' | 'INVESTMENT' | 'JV' | 'SUPPLY' | 'ACQUISITION';
  label: string;
  valueB: number;
  date: string;
  status: 'ACTIVE' | 'PENDING' | 'RUMORED' | 'COMPLETED';
}

export const SECTOR_COLORS: Record<Sector, string> = {
  Banking: '#ff3b3b',
  Technology: '#2196f3',
  Healthcare: '#00e676',
  Energy: '#ffc107',
  Industrials: '#b388ff',
  Consumer: '#ff6d00',
  Materials: '#8d6e63',
  Utilities: '#00bcd4',
  'Real Estate': '#78909c',
  Telecom: '#e91e63',
};

export function riskColor(level: RiskLevel): string {
  const m: Record<RiskLevel, string> = {
    LOW: '#00e676',
    MODERATE: '#ffc107',
    ELEVATED: '#ff6d00',
    HIGH: '#ff3b3b',
    CRITICAL: '#ff1744',
  };
  return m[level];
}
