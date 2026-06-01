import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await signup(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      {/* Grid background */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,#1e253022 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,#1e253022 40px)', pointerEvents: 'none' }} />

      <div style={{ width: 420, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-disp)', fontSize: 32, letterSpacing: 6, color: 'var(--text)', marginBottom: 4 }}>◆ WALLST WATCH</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', letterSpacing: 3 }}>BANKING COMMAND CENTER</div>
        </div>

        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', borderRadius: 6, padding: 32 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 24 }}>
            {mode === 'login' ? '> SIGN IN TO YOUR ACCOUNT' : '> CREATE FREE ACCOUNT'}
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'signup' && (
              <div>
                <label style={labelStyle}>FULL NAME</label>
                <input style={inputStyle} type="text" placeholder="John Smith" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <div style={{ background: '#ff3b3b15', border: '1px solid #ff3b3b55', borderRadius: 4, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 10, color: '#ff3b3b' }}>
                ✕ {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              background: loading ? '#4a5568' : 'var(--red)', color: '#fff', border: 'none',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: 1,
              padding: '13px', borderRadius: 3, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'background .2s',
            }}>
              {loading ? 'PLEASE WAIT…' : mode === 'login' ? 'SIGN IN →' : 'CREATE ACCOUNT →'}
            </button>
          </form>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)' }}>
            {mode === 'login' ? (
              <>Don't have an account?{' '}
                <span style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/signup')}>Sign up free →</span>
              </>
            ) : (
              <>Already have an account?{' '}
                <span style={{ color: 'var(--red)', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/login')}>Sign in →</span>
              </>
            )}
          </div>
        </div>

        {mode === 'signup' && (
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 20 }}>
            {[['◆', 'Free forever'], ['▲', 'Live data'], ['◈', 'Insider flow']].map(([icon, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, color: 'var(--red)', marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: 1 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-dim)', cursor: 'pointer' }} onClick={() => navigate('/')}>← Back to home</span>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-mono)', fontSize: 8, fontWeight: 700,
  color: 'var(--text-dim)', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase',
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border)',
  borderRadius: 3, padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12,
  color: 'var(--text)', outline: 'none', transition: 'border-color .2s', boxSizing: 'border-box',
};
