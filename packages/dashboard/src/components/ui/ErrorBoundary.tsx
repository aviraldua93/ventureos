import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', gap: '12px',
            color: 'var(--text-secondary, #8899aa)', fontFamily: 'var(--font-mono, monospace)',
          }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary, #e8edf4)' }}>
              Component Error
            </span>
            <span style={{ fontSize: '12px', opacity: 0.7, maxWidth: 400, textAlign: 'center' }}>
              {this.state.error?.message ?? 'An unexpected error occurred'}
            </span>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                marginTop: 8, padding: '6px 16px', borderRadius: 6,
                border: '1px solid var(--border, #2a3544)',
                background: 'var(--surface-1, #111820)', color: 'var(--text-primary, #e8edf4)',
                cursor: 'pointer', fontSize: '12px',
              }}
            >
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
