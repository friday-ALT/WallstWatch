import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { hasPlanAccess } from '../../config/features';

interface Props {
  children: ReactNode;
  feature: string;
  requiredPlan?: 'pro' | 'professional' | 'institutional';
}

export function ProGate({ children, feature, requiredPlan = 'pro' }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userPlan = user?.plan ?? 'free';
  const trialActive = (user as any)?.trialActive ?? false;
  const hasAccess = hasPlanAccess(userPlan, requiredPlan, trialActive);

  if (hasAccess) return <>{children}</>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', fontFamily: 'var(--font-mono)', minHeight: 300 }}>
      <div style={{ fontSize: 32, color: 'var(--red)', marginBottom: 16 }}>◆</div>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--red)', letterSpacing: 3, marginBottom: 8 }}>
        {requiredPlan.toUpperCase()} FEATURE
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
        {feature}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-dim)', maxWidth: 320, lineHeight: 1.8, marginBottom: 24 }}>
        This feature requires a {requiredPlan === 'pro' ? 'Pro (£2.99/mo)' : requiredPlan === 'professional' ? 'Professional (£7.99/mo)' : 'Institutional (custom)'} subscription.
        {!user && ' Sign in or create a free account to start your 14-day Pro trial.'}
        {user && (user as any).trialDaysLeft === 0 && ' Your trial has expired. Upgrade to keep access.'}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => navigate('/pricing')}
          style={{ background: 'var(--red)', border: 'none', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '10px 24px', borderRadius: 3, cursor: 'pointer' }}>
          VIEW PRICING →
        </button>
        {!user && (
          <button onClick={() => navigate('/signup')}
            style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-sec)', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: '10px 20px', borderRadius: 3, cursor: 'pointer' }}>
            START FREE TRIAL
          </button>
        )}
      </div>
      <div style={{ marginTop: 20, fontSize: 9, color: 'var(--text-dim)' }}>
        New users get 14 days Pro free — no credit card required
      </div>
    </div>
  );
}
