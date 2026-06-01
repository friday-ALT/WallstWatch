/** When true, all Pro / Professional / Institutional features are unlocked in the UI. */
export const UNLOCK_ALL =
  import.meta.env.VITE_UNLOCK_ALL === 'true' || import.meta.env.DEV;

export type PlanTier = 'free' | 'pro' | 'professional' | 'institutional';

const PLAN_RANK: Record<PlanTier, number> = {
  free: 0,
  pro: 1,
  professional: 2,
  institutional: 3,
};

export function hasPlanAccess(
  userPlan: PlanTier | string | undefined,
  required: PlanTier,
  trialActive = false
): boolean {
  if (UNLOCK_ALL) return true;
  const effective = trialActive ? 'pro' : (userPlan ?? 'free');
  return PLAN_RANK[effective as PlanTier] >= PLAN_RANK[required];
}

export function effectivePlanLabel(
  userPlan: PlanTier | string | undefined,
  trialActive = false
): string {
  if (UNLOCK_ALL) return 'ALL ACCESS';
  if (trialActive) return 'PRO TRIAL';
  return (userPlan ?? 'free').toUpperCase();
}
