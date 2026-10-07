import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallbackTitle?: string;
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
        console.error('[Admin Console ErrorBoundary caught error]:', error, errorInfo);
    }

    public handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div
                    className="admin-box"
                    style={{
                        margin: '16px 0',
                        backgroundColor: '#fce8e6',
                        borderColor: '#c5221f',
                        padding: 16,
                    }}
                >
                    <div
                        className="admin-box-title"
                        style={{
                            backgroundColor: '#c5221f',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                        }}
                    >
                        <span>⚠️ EXCEPTION IN MODULE: {this.props.fallbackTitle || 'ADMIN VIEW'}</span>
                    </div>

                    <div style={{ marginTop: 10, fontSize: 12, color: '#333' }}>
                        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#900' }}>
                            An unexpected runtime error occurred while rendering this section:
                        </p>
                        <pre
                            style={{
                                backgroundColor: '#fff',
                                border: '1px solid #ccc',
                                padding: 8,
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: '#c5221f',
                                overflowX: 'auto',
                                maxHeight: 120,
                            }}
                        >
                            {this.state.error?.message || 'Unknown runtime error'}
                        </pre>

                        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                            <button
                                className="admin-btn admin-btn-primary"
                                onClick={this.handleReset}
                                style={{ fontWeight: 'bold' }}
                            >
                                🔄 Retry Rendering This Section
                            </button>
                            <button
                                className="admin-btn"
                                onClick={() => window.location.reload()}
                            >
                                Reload Administrative Console
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
export default ErrorBoundary;
