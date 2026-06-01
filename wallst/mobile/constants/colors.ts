export const C = {
  bgDark:    '#0a0c0f',
  bgPanel:   '#0f1216',
  bgCard:    '#141820',
  border:    '#1e2530',
  borderGlow:'#2a3040',
  textPrimary:   '#e8eaed',
  textSecondary: '#8b95a5',
  textDim:       '#4a5568',
  red:    '#ff3b3b',
  green:  '#00e676',
  amber:  '#ffc107',
  blue:   '#2196f3',
  cyan:   '#00bcd4',
  purple: '#b388ff',
  critical: '#ff1744',
  high:     '#ff6d00',
  elevated: '#ffc400',
  moderate: '#00e676',
} as const;

export function riskColor(level: number) {
  if (level >= 8) return C.critical;
  if (level >= 6) return C.amber;
  return C.green;
}
