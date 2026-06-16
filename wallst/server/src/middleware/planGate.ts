import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/database.js';
import { config, type PlanTier } from '../config/index.js';

interface DBUser {
  id: string;
  plan: string;
  trial_ends: string | null;
}

function effectivePlan(user: DBUser): PlanTier {
  if (user.trial_ends && new Date(user.trial_ends) > new Date()) return 'pro';
  return (user.plan as PlanTier) ?? 'free';
}

export function optionalAuth(req: any, _res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    req.user = jwt.verify(token, config.jwtSecret);
  } catch {
    /* ignore */
  }
  next();
}

export function requirePlan(...plans: PlanTier[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (config.unlockAll) return next();
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Sign in required', requiredPlan: plans[0] });
    try {
      const payload = jwt.verify(token, config.jwtSecret) as { id: string };
      const user = db.prepare('SELECT id, plan, trial_ends FROM users WHERE id = ?').get(payload.id) as
        | DBUser
        | undefined;
      if (!user) return res.status(401).json({ error: 'User not found' });
      const plan = effectivePlan(user);
      const rank = config.planRank[plan];
      const required = Math.min(...plans.map((p) => config.planRank[p]));
      if (rank >= required) return next();
      return res.status(403).json({ error: 'Upgrade required', requiredPlan: plans[0], currentPlan: plan });
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
