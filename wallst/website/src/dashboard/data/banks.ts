export interface Signal { t: string; y: 'ok' | 'warn' | 'caution' }
export interface Bank {
  sym: string; nm: string; pr: string; ch: string; d: 'up'|'down';
  mc: string; c1: string; ni: string;
  rk: 'CRITICAL'|'HIGH'|'ELEVATED'|'MODERATE'; rl: number;
  sg: Signal[]; q: string;
  lat: number; lng: number; city: string; country: string; iso: string;
}

export const BANKS: Bank[] = [
  { sym:'JPM', nm:'JPMorgan Chase',   pr:'283.15', ch:'+1.11%', d:'up',   mc:'$838B',  c1:'15.3%', ni:'$104.5B', rk:'MODERATE', rl:3, lat:40.7566, lng:-73.9735, city:'New York',      country:'United States', iso:'US', sg:[{t:'CET1 at 15.3% — fortress balance sheet',y:'ok'},{t:'$50B buyback for 2026',y:'ok'},{t:'Record $57.5B net income FY25',y:'ok'},{t:'Iran conflict flagged as near-term risk',y:'caution'}], q:'No one can consistently predict crises. Build institutions that withstand a wide range of outcomes.' },
  { sym:'GS',  nm:'Goldman Sachs',    pr:'562.40', ch:'-0.86%', d:'down', mc:'$271B',  c1:'14.8%', ni:'$7.6B',   rk:'ELEVATED', rl:5, lat:40.7589, lng:-73.9851, city:'New York',      country:'United States', iso:'US', sg:[{t:"S&P target 7,600 — most bullish among peers",y:'caution'},{t:'FICC revenue concentrated in volatility',y:'warn'},{t:'Apple Card transferred to JPM',y:'ok'},{t:'Private credit mark-to-model risk',y:'warn'}], q:'Goldman targets 7,600 year-end — but downside to 5,400 in severe oil shock.' },
  { sym:'MS',  nm:'Morgan Stanley',   pr:'118.23', ch:'+1.24%', d:'up',   mc:'$191B',  c1:'15.1%', ni:'$8.2B',   rk:'MODERATE', rl:4, lat:40.7580, lng:-73.9815, city:'New York',      country:'United States', iso:'US', sg:[{t:"S&P target 7,800 — AI capex thesis",y:'ok'},{t:'Wealth management AUM growing',y:'ok'},{t:'Lowered META target to $775',y:'caution'}], q:"Morgan Stanley expects AI capex and a 'rolling recovery' to drive gains." },
  { sym:'BAC', nm:'Bank of America',  pr:'42.67',  ch:'+1.26%', d:'up',   mc:'$337B',  c1:'11.9%', ni:'$57.2B',  rk:'ELEVATED', rl:5, lat:35.2271, lng:-80.8431, city:'Charlotte',     country:'United States', iso:'US', sg:[{t:"S&P target 7,100 — most cautious major bank",y:'warn'},{t:'CET1 11.9% — lower buffer than JPM',y:'warn'},{t:'Consumer franchise provides stability',y:'ok'}], q:"BofA warns of AI 'air pocket' — not a bubble — as market fuel diminishes." },
  { sym:'C',   nm:'Citigroup',        pr:'71.85',  ch:'-0.44%', d:'down', mc:'$139B',  c1:'13.4%', ni:'$52.1B',  rk:'HIGH',     rl:7, lat:40.7218, lng:-74.0090, city:'New York',      country:'United States', iso:'US', sg:[{t:'Transformation plan — restructuring drag',y:'warn'},{t:'EM exposure + Iran conflict',y:'warn'},{t:'Consent orders still active',y:'warn'},{t:'Treasury services franchise strong',y:'ok'}], q:"Citi's EM exposure makes it the most geopolitically sensitive of the Big Six." },
  { sym:'WFC', nm:'Wells Fargo',      pr:'72.14',  ch:'+1.23%', d:'up',   mc:'$210B',  c1:'11.2%', ni:'$52.8B',  rk:'ELEVATED', rl:6, lat:37.7879, lng:-122.4075,city:'San Francisco', country:'United States', iso:'US', sg:[{t:'Asset cap still constrains growth',y:'warn'},{t:'CRE concentration — office exposure',y:'warn'},{t:'Mortgage market share growing',y:'ok'}], q:'Asset cap removal would unlock significant earnings power.' },
  { sym:'DB',  nm:'Deutsche Bank',    pr:'18.42',  ch:'-1.34%', d:'down', mc:'$45B',   c1:'13.8%', ni:'€13.6B',  rk:'HIGH',     rl:7, lat:50.1109, lng:8.6821,   city:'Frankfurt',     country:'Germany',       iso:'DE', sg:[{t:'European energy spillover risk',y:'warn'},{t:"S&P target 8,000 — biggest bull",y:'caution'},{t:'Derivatives exposure outsized',y:'warn'}], q:'Deutsche maintains most bullish S&P target at 8,000.' },
  { sym:'UBS', nm:'UBS Group',        pr:'32.56',  ch:'+0.67%', d:'up',   mc:'$102B',  c1:'14.5%', ni:'CHF 7.1B',rk:'ELEVATED', rl:5, lat:47.3769, lng:8.5417,   city:'Zurich',        country:'Switzerland',   iso:'CH', sg:[{t:'CS integration ongoing',y:'caution'},{t:'Wealth AUM at record',y:'ok'},{t:'Swiss regulators may require higher buffers',y:'warn'}], q:'Post-CS, UBS is the dominant European wealth franchise.' },
  { sym:'BCS', nm:'Barclays',         pr:'13.87',  ch:'-0.52%', d:'down', mc:'$41B',   c1:'13.6%', ni:'£12.4B',  rk:'HIGH',     rl:6, lat:51.5074, lng:-0.1278,  city:'London',        country:'United Kingdom',iso:'GB', sg:[{t:'UK gilt sensitivity',y:'warn'},{t:'IB revenue recovering but volatile',y:'caution'},{t:'Consumer credit delinquency uptick',y:'warn'}], q:'The UK gilt crisis showed how fast sovereign concerns cascade.' },
  { sym:'HSBC',nm:'HSBC Holdings',    pr:'48.92',  ch:'+0.34%', d:'up',   mc:'$168B',  c1:'14.7%', ni:'$36.8B',  rk:'ELEVATED', rl:5, lat:22.2783, lng:114.1657, city:'Hong Kong',     country:'Hong Kong',     iso:'HK', sg:[{t:"S&P target 7,500",y:'ok'},{t:'Asia-Pacific: China slowdown risk',y:'warn'},{t:'Dollar strength hits non-USD revenue',y:'caution'}], q:'Dual China/dollar exposure creates complex 2026 risk profile.' },
  { sym:'BNP', nm:'BNP Paribas',      pr:'72.30',  ch:'-0.88%', d:'down', mc:'$82B',   c1:'13.2%', ni:'€24.1B',  rk:'HIGH',     rl:6, lat:48.8566, lng:2.3522,   city:'Paris',         country:'France',        iso:'FR', sg:[{t:'Eurozone energy crisis 2.0 risk',y:'warn'},{t:'French sovereign spread widening',y:'warn'},{t:'CIB positioned for FICC vol',y:'ok'}], q:'European banks face secondary oil shock through industrial borrowers.' },
  { sym:'SCHW',nm:'Charles Schwab',   pr:'84.50',  ch:'+2.12%', d:'up',   mc:'$156B',  c1:'28.4%', ni:'$9.8B',   rk:'MODERATE', rl:3, lat:32.8998, lng:-96.7699, city:'Westlake',      country:'United States', iso:'US', sg:[{t:'Client assets record $10.1T',y:'ok'},{t:'Deposit migration stabilized',y:'ok'},{t:'Higher-for-longer benefits NII',y:'ok'}], q:'Massive client base provides structural advantage in volatility.' },
];

export const TICKER_SYMBOLS = ['JPM','GS','MS','BAC','C','WFC','DB','UBS','BCS','HSBC','BNP','SCHW','SPY','QQQ','VIX','XLF'];

export function riskColor(rl: number) {
  if (rl >= 7) return '#ff6d00';
  if (rl >= 5) return '#ffc107';
  return '#00e676';
}

/** 0–100 market risk index (higher = more risk) */
export function riskScore(rl: number) {
  return Math.min(100, Math.round(rl * 12 + 8));
}

export function riskClass(rk: Bank['rk']) {
  const m: Record<Bank['rk'], string> = {
    CRITICAL: 'risk-critical',
    HIGH: 'risk-high',
    ELEVATED: 'risk-elevated',
    MODERATE: 'risk-moderate',
  };
  return m[rk] ?? 'risk-moderate';
}
