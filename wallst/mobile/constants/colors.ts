export type AppColors = {
  bgDark: string;
  bgPanel: string;
  bgCard: string;
  border: string;
  borderGlow: string;
  textPrimary: string;
  textSecondary: string;
  textDim: string;
  red: string;
  green: string;
  amber: string;
  blue: string;
  cyan: string;
  purple: string;
  critical: string;
  high: string;
  elevated: string;
  moderate: string;
};

export const darkColors: AppColors = {
  bgDark: '#000000',
  bgPanel: '#0c0c0c',
  bgCard: '#1c1c1e',
  border: '#1e2530',
  borderGlow: '#2a3040',
  textPrimary: '#e8eaed',
  textSecondary: '#8b95a5',
  textDim: '#4a5568',
  red: '#ff3b3b',
  green: '#00e676',
  amber: '#ffc107',
  blue: '#2196f3',
  cyan: '#00bcd4',
  purple: '#b388ff',
  critical: '#ff1744',
  high: '#ff6d00',
  elevated: '#ffc400',
  moderate: '#00e676',
};

export const lightColors: AppColors = {
  bgDark: '#ffffff',
  bgPanel: '#f2f2f7',
  bgCard: '#ffffff',
  border: '#d4dbe6',
  borderGlow: '#c5ced9',
  textPrimary: '#12151c',
  textSecondary: '#4a5568',
  textDim: '#7a8699',
  red: '#d32f2f',
  green: '#00875a',
  amber: '#e6a700',
  blue: '#1565c0',
  cyan: '#00838f',
  purple: '#7b1fa2',
  critical: '#c62828',
  high: '#ef6c00',
  elevated: '#f9a825',
  moderate: '#00875a',
};

/** @deprecated use useColors() for theme-aware colors */
export const C = darkColors;

export function riskColor(level: number, colors: AppColors = darkColors) {
  if (level >= 8) return colors.critical;
  if (level >= 6) return colors.amber;
  return colors.green;
}
