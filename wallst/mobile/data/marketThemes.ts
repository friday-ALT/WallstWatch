/** CNBC-inspired thematic market buckets — symbols mapped to Finnhub-tradeable ETFs/stocks */

export interface ThemeSymbol {
  sym: string;
  label: string;
}

export interface MarketTheme {
  id: string;
  title: string;
  subtitle: string;
  symbols: ThemeSymbol[];
}

export const MARKET_THEMES: MarketTheme[] = [
  {
    id: 'yield-curve',
    title: 'Yield curve',
    subtitle: 'Treasury duration proxies',
    symbols: [
      { sym: 'SHY', label: '1–3Y Treasuries' },
      { sym: 'IEI', label: '3–7Y Treasuries' },
      { sym: 'IEF', label: '7–10Y Treasuries' },
      { sym: 'TLT', label: '20Y+ Treasuries' },
    ],
  },
  {
    id: 'inflation',
    title: 'Inflation pressure',
    subtitle: 'Commodity & inflation hedges',
    symbols: [
      { sym: 'GLD', label: 'Gold' },
      { sym: 'USO', label: 'Crude oil' },
      { sym: 'CPER', label: 'Copper' },
      { sym: 'SLV', label: 'Silver' },
      { sym: 'UNG', label: 'Natural gas' },
    ],
  },
  {
    id: 'global-growth',
    title: 'Global growth',
    subtitle: 'Risk-on & emerging markets',
    symbols: [
      { sym: 'SPY', label: 'S&P 500' },
      { sym: 'CPER', label: 'Copper' },
      { sym: 'USO', label: 'Oil' },
      { sym: 'EEM', label: 'Emerging markets' },
      { sym: 'URTH', label: 'World ex-US' },
    ],
  },
  {
    id: 'safe-haven',
    title: 'Safe haven stress',
    subtitle: 'Flight-to-quality signals',
    symbols: [
      { sym: 'GLD', label: 'Gold' },
      { sym: 'SLV', label: 'Silver' },
      { sym: 'TLT', label: 'Long bonds' },
      { sym: 'FXY', label: 'Japanese yen' },
      { sym: 'VIX', label: 'VIX' },
    ],
  },
  {
    id: 'dollar',
    title: 'Dollar strength',
    subtitle: 'USD vs assets & FX',
    symbols: [
      { sym: 'UUP', label: 'US Dollar index' },
      { sym: 'GLD', label: 'Gold' },
      { sym: 'EEM', label: 'Emerging markets' },
      { sym: 'FXE', label: 'Euro' },
      { sym: 'FXY', label: 'Yen' },
    ],
  },
  {
    id: 'credit-stress',
    title: 'Credit stress',
    subtitle: 'Spreads & financial risk',
    symbols: [
      { sym: 'TLT', label: 'Treasuries' },
      { sym: 'VIX', label: 'Volatility' },
      { sym: 'HYG', label: 'High yield' },
      { sym: 'LQD', label: 'Investment grade' },
      { sym: 'XLF', label: 'Financials' },
    ],
  },
  {
    id: 'recession',
    title: 'Recession probability',
    subtitle: 'Late-cycle indicators',
    symbols: [
      { sym: 'TLT', label: '10Y+ proxy' },
      { sym: 'SHY', label: '2Y proxy' },
      { sym: 'SPY', label: 'S&P 500' },
      { sym: 'IWM', label: 'Russell 2000' },
      { sym: 'CPER', label: 'Copper' },
    ],
  },
  {
    id: 'china-demand',
    title: 'China demand proxy',
    subtitle: 'Industrial & EM sensitivity',
    symbols: [
      { sym: 'CPER', label: 'Copper' },
      { sym: 'USO', label: 'Oil' },
      { sym: 'EEM', label: 'Emerging markets' },
      { sym: 'FXI', label: 'China large-cap' },
      { sym: 'VALE', label: 'Vale' },
    ],
  },
  {
    id: 'geopolitical',
    title: 'War / geopolitical stress',
    subtitle: 'Energy, defense & vol',
    symbols: [
      { sym: 'GLD', label: 'Gold' },
      { sym: 'USO', label: 'Oil' },
      { sym: 'VIX', label: 'VIX' },
      { sym: 'ITA', label: 'Aerospace & defense' },
      { sym: 'LMT', label: 'Lockheed Martin' },
    ],
  },
  {
    id: 'tech-spec',
    title: 'Tech speculation',
    subtitle: 'Growth & risk appetite',
    symbols: [
      { sym: 'ARKK', label: 'ARK Innovation' },
      { sym: 'QQQ', label: 'Nasdaq 100' },
      { sym: 'TSLA', label: 'Tesla' },
      { sym: 'COIN', label: 'Coinbase' },
      { sym: 'NVDA', label: 'NVIDIA' },
    ],
  },
  {
    id: 'housing',
    title: 'Housing market health',
    subtitle: 'Homebuilders & rates sensitivity',
    symbols: [
      { sym: 'XHB', label: 'Homebuilders' },
      { sym: 'LEN', label: 'Lennar' },
      { sym: 'DHI', label: 'DR Horton' },
      { sym: 'HD', label: 'Home Depot' },
      { sym: 'TLT', label: 'Mortgage rate proxy' },
    ],
  },
  {
    id: 'consumer',
    title: 'Consumer stress',
    subtitle: 'Discretionary vs staples',
    symbols: [
      { sym: 'DG', label: 'Dollar General' },
      { sym: 'WMT', label: 'Walmart' },
      { sym: 'MCD', label: "McDonald's" },
      { sym: 'V', label: 'Visa' },
      { sym: 'TGT', label: 'Target' },
    ],
  },
  {
    id: 'shipping',
    title: 'Shipping / global trade',
    subtitle: 'Logistics & freight',
    symbols: [
      { sym: 'FDX', label: 'FedEx' },
      { sym: 'UPS', label: 'UPS' },
      { sym: 'ZIM', label: 'ZIM Shipping' },
      { sym: 'BDRY', label: 'Dry bulk shipping' },
    ],
  },
  {
    id: 'energy-transition',
    title: 'Energy transition',
    subtitle: 'Clean energy & materials',
    symbols: [
      { sym: 'TSLA', label: 'Tesla' },
      { sym: 'NEE', label: 'NextEra Energy' },
      { sym: 'FSLR', label: 'First Solar' },
      { sym: 'LIT', label: 'Lithium & battery' },
      { sym: 'CPER', label: 'Copper' },
    ],
  },
  {
    id: 'cre-stress',
    title: 'Commercial real estate',
    subtitle: 'CRE & office exposure',
    symbols: [
      { sym: 'VNQ', label: 'REIT index' },
      { sym: 'XLRE', label: 'Real estate sector' },
      { sym: 'SPG', label: 'Simon Property' },
      { sym: 'O', label: 'Realty Income' },
    ],
  },
];

export const ALL_THEME_SYMBOLS = [
  ...new Set(MARKET_THEMES.flatMap((t) => t.symbols.map((s) => s.sym))),
];
