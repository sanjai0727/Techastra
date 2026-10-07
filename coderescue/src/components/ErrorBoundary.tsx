import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CodeRescue ErrorBoundary] Uncaught runtime exception:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetState = () => {
    try {
      localStorage.removeItem('code_rescue_contest_state_v1');
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#008080',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          fontFamily: "'Segoe UI', Tahoma, sans-serif"
        }}>
          <div style={{
            maxWidth: 550,
            width: '100%',
            backgroundColor: '#c0c0c0',
            border: '2px solid #ffffff',
            borderRightColor: '#000000',
            borderBottomColor: '#000000',
            boxShadow: '3px 3px 10px rgba(0,0,0,0.5)',
            padding: 2
          }}>
            <div style={{
              backgroundColor: '#000080',
              color: '#ffffff',
              padding: '4px 8px',
              fontWeight: 'bold',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>⚠️ TECHASTRA SYSTEM EXCEPTION HANDLER</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px inset #808080',
                padding: 12,
                marginBottom: 14,
                fontSize: 12,
                color: '#111'
              }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#c5221f' }}>
                  A workstation runtime error was intercepted:
                </p>
                <pre style={{
                  margin: 0,
                  fontSize: 11,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  color: '#333'
                }}>
                  {this.state.error?.message || 'Unknown runtime error'}
                </pre>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={this.handleResetState}
                  style={{
                    backgroundColor: '#c0c0c0',
                    border: '2px solid #fff',
                    borderRightColor: '#000',
                    borderBottomColor: '#000',
                    padding: '4px 14px',
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Clear Cached Session
                </button>
                <button
                  onClick={this.handleReload}
                  style={{
                    backgroundColor: '#000080',
                    color: '#fff',
                    border: '2px solid #fff',
                    borderRightColor: '#000',
                    borderBottomColor: '#000',
                    padding: '4px 18px',
                    fontSize: 12,
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Reload Arena
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
