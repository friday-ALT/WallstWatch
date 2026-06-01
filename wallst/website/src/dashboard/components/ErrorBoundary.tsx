import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; label?: string; }
interface State { hasError: boolean; error: string; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(e: Error): State {
    return { hasError: true, error: e.message };
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ padding: 24, fontFamily: 'var(--font-mono)' }}>
        <div style={{ color: '#ff3b3b', fontSize: 10, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
          ◆ VIEW ERROR — {this.props.label ?? 'COMPONENT'}
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: 10, background: 'var(--bg-card)', border: '1px solid #ff3b3b44', borderRadius: 4, padding: 12, lineHeight: 1.6 }}>
          {this.state.error}
        </div>
        <button onClick={() => this.setState({ hasError: false, error: '' })}
          style={{ marginTop: 12, background: 'none', border: '1px solid var(--border)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 9, padding: '5px 12px', borderRadius: 2, cursor: 'pointer' }}>
          RETRY
        </button>
      </div>
    );
  }
}
